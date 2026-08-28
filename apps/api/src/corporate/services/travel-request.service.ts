import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TravelRequest } from '../entities/travel-request.entity';
import { TravelApproval } from '../entities/travel-approval.entity';
import { CorporateBudget } from '../entities/corporate-budget.entity';
import {
  CreateTravelRequestDto,
  UpdateTravelRequestDto,
  CancelTravelRequestDto,
  TravelRequestFilterDto,
  CompleteRequestDto,
} from '../dto/travel-request.dto';
import { RequestStatus, TravelClass } from '../enums/corporate.enums';
import { TravelPolicyService } from './travel-policy.service';
import { CorporateMemberService } from './corporate-member.service';

@Injectable()
export class TravelRequestService {
  constructor(
    @InjectRepository(TravelRequest)
    private readonly requestRepo: Repository<TravelRequest>,
    @InjectRepository(TravelApproval)
    private readonly approvalRepo: Repository<TravelApproval>,
    @InjectRepository(CorporateBudget)
    private readonly budgetRepo: Repository<CorporateBudget>,
    private readonly policyService: TravelPolicyService,
    private readonly memberService: CorporateMemberService,
    private readonly dataSource: DataSource,
  ) {}

  // ── Validation helpers ────────────────────────────────────────────────────

  private validateDates(departureDate: string, returnDate: string) {
    const dep = new Date(departureDate);
    const ret = new Date(returnDate);
    if (dep >= ret) {
      throw new BadRequestException('Return date must be after departure date');
    }
    return { dep, ret };
  }

  private async validateAgainstPolicy(
    policy: Awaited<ReturnType<TravelPolicyService['findOne']>> | null,
    dto: CreateTravelRequestDto | UpdateTravelRequestDto,
  ) {
    if (!policy) return [];
    const warnings: string[] = [];

    if (dto.departureDate) {
      const dep = new Date(dto.departureDate as string);
      const today = new Date();
      const daysDiff = Math.floor((dep.getTime() - today.getTime()) / 86400000);
      if (policy.advanceBookingDays && daysDiff < policy.advanceBookingDays) {
        warnings.push(
          `Policy requires at least ${policy.advanceBookingDays} days advance notice (${daysDiff} days given)`,
        );
      }

      // Check blackout dates
      if (policy.blackoutDates?.length) {
        for (const range of policy.blackoutDates) {
          const start = new Date(range.start);
          const end = new Date(range.end);
          if (dep >= start && dep <= end) {
            throw new BadRequestException(
              `Departure date falls within a blackout period (${range.start} – ${range.end}${range.reason ? ': ' + range.reason : ''})`,
            );
          }
        }
      }
    }

    if (dto.travelClass && policy.allowedClasses?.length) {
      if (!policy.allowedClasses.includes(dto.travelClass as TravelClass)) {
        warnings.push(
          `Travel class "${dto.travelClass}" is not in the allowed list: ${policy.allowedClasses.join(', ')}`,
        );
      }
    }

    if (dto.estimatedCost && policy.maxBudgetPerTrip) {
      if (Number(dto.estimatedCost) > Number(policy.maxBudgetPerTrip) && !dto.budgetOverrideReason) {
        warnings.push(
          `Estimated cost ($${dto.estimatedCost}) exceeds policy cap ($${policy.maxBudgetPerTrip}). Provide budgetOverrideReason to proceed.`,
        );
      }
    }

    return warnings;
  }

  // ── Create (DRAFT) ────────────────────────────────────────────────────────

  async create(
    companyId: string,
    requesterId: string,
    requesterName: string,
    dto: CreateTravelRequestDto,
  ): Promise<{ request: TravelRequest; warnings: string[] }> {
    const memberships = await this.memberService.findByUserId(requesterId, companyId);
    if (!memberships.length) {
      throw new ForbiddenException('You are not a member of this company');
    }

    const membership = memberships[0];
    const effectiveDeptId = dto.departmentId ?? membership.departmentId;

    // Validate dates
    if (dto.departureDate && dto.returnDate) {
      this.validateDates(dto.departureDate, dto.returnDate);
    }

    // Resolve policy
    let policy = dto.policyId
      ? await this.policyService.findOne(dto.policyId, companyId)
      : await this.policyService.getDefaultPolicy(companyId);

    const warnings = await this.validateAgainstPolicy(policy, dto);

    const budgetOverride = !!(dto.budgetOverrideReason);

    const request = this.requestRepo.create({
      ...dto,
      companyId,
      requesterId,
      requesterName,
      departmentId: effectiveDeptId,
      policyId: policy?.id,
      status: RequestStatus.DRAFT,
      budgetOverride,
      currentApprovalStep: 0,
      currency: dto.currency ?? membership.company?.currency ?? 'USD',
    });

    const saved = await this.requestRepo.save(request);
    return { request: saved, warnings };
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async submit(id: string, requesterId: string, companyId: string): Promise<TravelRequest> {
    const request = await this.findOne(id, companyId);

    if (request.requesterId !== requesterId) {
      throw new ForbiddenException('Only the requester can submit this request');
    }
    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestException(`Cannot submit a request with status "${request.status}"`);
    }

    // Validate required fields
    if (!request.departureDate || !request.returnDate) {
      throw new BadRequestException('Departure and return dates are required before submitting');
    }

    const policy = request.policyId
      ? await this.policyService.findOne(request.policyId, companyId)
      : null;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const newStatus =
        policy && policy.requiresApproval && policy.approvalSteps?.length
          ? RequestStatus.SUBMITTED
          : RequestStatus.APPROVED;

      request.status = newStatus;
      request.currentApprovalStep = newStatus === RequestStatus.SUBMITTED ? 1 : 0;

      if (newStatus === RequestStatus.APPROVED) {
        request.approvedAt = new Date();
      }

      const saved = await qr.manager.save(TravelRequest, request);

      // Create first pending approval record if needed
      if (newStatus === RequestStatus.SUBMITTED && policy) {
        const sortedSteps = [...(policy.approvalSteps ?? [])].sort(
          (a, b) => a.stepOrder - b.stepOrder,
        );
        if (sortedSteps.length > 0) {
          const firstStep = sortedSteps[0];
          const approval = this.approvalRepo.create({
            requestId: saved.id,
            approverId: firstStep.approverId ?? requesterId, // fallback: reassign in real usage
            stepOrder: firstStep.stepOrder,
          });
          await qr.manager.save(TravelApproval, approval);
        }
      }

      // Reserve budget
      await this.adjustBudgetReservation(qr, companyId, request.departmentId, Number(request.estimatedCost), 'reserve');

      await qr.commitTransaction();
      return this.findOne(saved.id, companyId);
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ── Budget helpers ────────────────────────────────────────────────────────

  private async adjustBudgetReservation(
    qr: any,
    companyId: string,
    departmentId: string | undefined,
    amount: number,
    action: 'reserve' | 'release',
  ) {
    const year = new Date().getFullYear();
    const delta = action === 'reserve' ? amount : -amount;

    // Company-wide budget
    const companyBudget = await this.budgetRepo.findOne({
      where: { companyId, departmentId: undefined, fiscalYear: year, fiscalQuarter: undefined },
    });
    if (companyBudget) {
      companyBudget.reservedAmount = Math.max(0, Number(companyBudget.reservedAmount) + delta);
      await qr.manager.save(CorporateBudget, companyBudget);
    }

    // Department budget
    if (departmentId) {
      const deptBudget = await this.budgetRepo.findOne({
        where: { companyId, departmentId, fiscalYear: year, fiscalQuarter: undefined },
      });
      if (deptBudget) {
        deptBudget.reservedAmount = Math.max(0, Number(deptBudget.reservedAmount) + delta);
        await qr.manager.save(CorporateBudget, deptBudget);
      }
    }
  }

  private async moveBudgetFromReservedToSpent(
    qr: any,
    companyId: string,
    departmentId: string | undefined,
    amount: number,
  ) {
    const year = new Date().getFullYear();
    const budgets = await this.budgetRepo.find({
      where: [
        { companyId, departmentId: undefined, fiscalYear: year, fiscalQuarter: undefined },
        ...(departmentId ? [{ companyId, departmentId, fiscalYear: year, fiscalQuarter: undefined }] : []),
      ],
    });

    for (const b of budgets) {
      b.reservedAmount = Math.max(0, Number(b.reservedAmount) - amount);
      b.spentAmount = Number(b.spentAmount) + amount;
      await qr.manager.save(CorporateBudget, b);
    }
  }

  // ── Update (only in DRAFT) ────────────────────────────────────────────────

  async update(
    id: string,
    requesterId: string,
    companyId: string,
    dto: UpdateTravelRequestDto,
  ): Promise<TravelRequest> {
    const request = await this.findOne(id, companyId);

    if (request.requesterId !== requesterId) {
      throw new ForbiddenException('Only the requester can edit this request');
    }
    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT requests can be edited');
    }

    this.requestRepo.merge(request, dto as any);
    return this.requestRepo.save(request);
  }

  // ── Cancel ────────────────────────────────────────────────────────────────

  async cancel(
    id: string,
    userId: string,
    companyId: string,
    dto: CancelTravelRequestDto,
  ): Promise<TravelRequest> {
    const request = await this.findOne(id, companyId);
    const cancellableStatuses = [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.UNDER_REVIEW];

    if (!cancellableStatuses.includes(request.status)) {
      throw new BadRequestException(`Cannot cancel a request with status "${request.status}"`);
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      request.status = RequestStatus.CANCELLED;
      request.rejectionReason = dto.reason;
      await qr.manager.save(TravelRequest, request);

      // Release budget reservation
      await this.adjustBudgetReservation(
        qr,
        companyId,
        request.departmentId,
        Number(request.estimatedCost),
        'release',
      );

      await qr.commitTransaction();
      return this.findOne(id, companyId);
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ── Complete ──────────────────────────────────────────────────────────────

  async complete(id: string, companyId: string, dto: CompleteRequestDto): Promise<TravelRequest> {
    const request = await this.findOne(id, companyId);

    if (request.status !== RequestStatus.APPROVED) {
      throw new BadRequestException('Only APPROVED requests can be marked as completed');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      request.status = RequestStatus.COMPLETED;
      request.completedAt = new Date();
      if (dto.notes) request.notes = dto.notes;
      await qr.manager.save(TravelRequest, request);

      // Move from reserved to spent
      await this.moveBudgetFromReservedToSpent(
        qr,
        companyId,
        request.departmentId,
        Number(request.estimatedCost),
      );

      await qr.commitTransaction();
      return this.findOne(id, companyId);
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async findAllByCompany(companyId: string, filter: TravelRequestFilterDto) {
    const page = Math.max(1, Number(filter.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(filter.limit ?? 20)));
    const skip = (page - 1) * limit;

    const qb = this.requestRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.approvals', 'approvals')
      .where('r.companyId = :companyId', { companyId })
      .orderBy('r.createdAt', 'DESC');

    if (filter.status) {
      qb.andWhere('r.status = :status', { status: filter.status.toUpperCase() });
    }
    if (filter.departmentId) {
      qb.andWhere('r.departmentId = :deptId', { deptId: filter.departmentId });
    }
    if (filter.requesterId) {
      qb.andWhere('r.requesterId = :rid', { rid: filter.requesterId });
    }
    if (filter.fromDate) {
      qb.andWhere('r.departureDate >= :from', { from: filter.fromDate });
    }
    if (filter.toDate) {
      qb.andWhere('r.departureDate <= :to', { to: filter.toDate });
    }
    if (filter.search) {
      qb.andWhere(
        '(LOWER(r.title) LIKE :s OR LOWER(r.destination) LIKE :s OR LOWER(r.requesterName) LIKE :s)',
        { s: `%${filter.search.toLowerCase()}%` },
      );
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findMyRequests(requesterId: string, companyId: string, filter: TravelRequestFilterDto) {
    return this.findAllByCompany(companyId, { ...filter, requesterId });
  }

  async findPendingForApprover(approverId: string, companyId: string) {
    return this.approvalRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.request', 'r')
      .where('a.approverId = :approverId', { approverId })
      .andWhere('a.decision = :decision', { decision: 'PENDING' })
      .andWhere('r.companyId = :companyId', { companyId })
      .orderBy('a.createdAt', 'ASC')
      .getMany();
  }

  async findOne(id: string, companyId?: string): Promise<TravelRequest> {
    const where: any = { id };
    if (companyId) where.companyId = companyId;

    const r = await this.requestRepo.findOne({
      where,
      relations: ['approvals', 'department', 'policy', 'policy.approvalSteps'],
    });
    if (!r) throw new NotFoundException(`Travel request "${id}" not found`);
    return r;
  }
}
