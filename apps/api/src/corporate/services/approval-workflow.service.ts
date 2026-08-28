import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TravelApproval } from '../entities/travel-approval.entity';
import { TravelRequest } from '../entities/travel-request.entity';
import { CorporateBudget } from '../entities/corporate-budget.entity';
import { ApprovalStep } from '../entities/approval-step.entity';
import { ApproveRequestDto, RejectRequestDto } from '../dto/approval-budget.dto';
import { ApprovalDecision, RequestStatus } from '../enums/corporate.enums';

@Injectable()
export class ApprovalWorkflowService {
  constructor(
    @InjectRepository(TravelApproval)
    private readonly approvalRepo: Repository<TravelApproval>,
    @InjectRepository(TravelRequest)
    private readonly requestRepo: Repository<TravelRequest>,
    @InjectRepository(CorporateBudget)
    private readonly budgetRepo: Repository<CorporateBudget>,
    @InjectRepository(ApprovalStep)
    private readonly stepRepo: Repository<ApprovalStep>,
    private readonly dataSource: DataSource,
  ) {}

  // ── Approve ───────────────────────────────────────────────────────────────

  async approve(
    requestId: string,
    approverId: string,
    approverName: string,
    companyId: string,
    dto: ApproveRequestDto,
  ): Promise<TravelRequest> {
    const request = await this.getApproveableRequest(requestId, companyId);
    const approval = await this.getPendingApprovalForApprover(requestId, approverId);

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // Record decision
      approval.decision = ApprovalDecision.APPROVED;
      approval.comment = dto.comment;
      approval.decidedAt = new Date();
      approval.approverName = approverName;
      await qr.manager.save(TravelApproval, approval);

      // Handle budget override grant
      if (dto.grantBudgetOverride) {
        if (!dto.budgetOverrideReason) {
          throw new BadRequestException('Budget override reason is required when granting an override');
        }
        request.budgetOverride = true;
        request.budgetOverrideReason = dto.budgetOverrideReason;
      }

      // Determine next step
      const allSteps = await this.stepRepo.find({
        where: { policyId: request.policyId },
        order: { stepOrder: 'ASC' },
      });

      const nextStep = allSteps.find((s) => s.stepOrder > approval.stepOrder);

      if (nextStep) {
        // Move to next approval step
        request.currentApprovalStep = nextStep.stepOrder;
        request.status = RequestStatus.UNDER_REVIEW;

        // Create next approval record
        const nextApproval = this.approvalRepo.create({
          requestId: request.id,
          approverId: nextStep.approverId ?? approverId,
          stepOrder: nextStep.stepOrder,
        });
        await qr.manager.save(TravelApproval, nextApproval);
      } else {
        // All steps done — fully approved
        request.status = RequestStatus.APPROVED;
        request.approvedAt = new Date();
        request.currentApprovalStep = 0;

        // Move budget from reserved → spent
        await this.moveBudgetFromReservedToSpent(
          qr,
          request.companyId,
          request.departmentId,
          Number(request.estimatedCost),
        );
      }

      await qr.manager.save(TravelRequest, request);
      await qr.commitTransaction();

      return this.requestRepo.findOne({
        where: { id: requestId },
        relations: ['approvals', 'policy'],
      }) as Promise<TravelRequest>;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ── Reject ────────────────────────────────────────────────────────────────

  async reject(
    requestId: string,
    approverId: string,
    approverName: string,
    companyId: string,
    dto: RejectRequestDto,
  ): Promise<TravelRequest> {
    const request = await this.getApproveableRequest(requestId, companyId);
    const approval = await this.getPendingApprovalForApprover(requestId, approverId);

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      approval.decision = ApprovalDecision.REJECTED;
      approval.comment = dto.comment ?? dto.reason;
      approval.decidedAt = new Date();
      approval.approverName = approverName;
      await qr.manager.save(TravelApproval, approval);

      request.status = RequestStatus.REJECTED;
      request.rejectionReason = dto.reason;
      await qr.manager.save(TravelRequest, request);

      // Release budget reservation
      await this.releaseReservation(qr, request.companyId, request.departmentId, Number(request.estimatedCost));

      await qr.commitTransaction();

      return this.requestRepo.findOne({
        where: { id: requestId },
        relations: ['approvals'],
      }) as Promise<TravelRequest>;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async getApproveableRequest(id: string, companyId: string): Promise<TravelRequest> {
    const request = await this.requestRepo.findOne({
      where: { id, companyId },
      relations: ['approvals', 'policy', 'policy.approvalSteps'],
    });
    if (!request) throw new NotFoundException(`Travel request "${id}" not found`);

    const reviewableStatuses = [RequestStatus.SUBMITTED, RequestStatus.UNDER_REVIEW];
    if (!reviewableStatuses.includes(request.status)) {
      throw new BadRequestException(
        `Request status is "${request.status}" and cannot be reviewed`,
      );
    }
    return request;
  }

  private async getPendingApprovalForApprover(
    requestId: string,
    approverId: string,
  ): Promise<TravelApproval> {
    const approval = await this.approvalRepo.findOne({
      where: { requestId, approverId, decision: ApprovalDecision.PENDING },
    });
    if (!approval) {
      throw new ForbiddenException(
        'You do not have a pending approval action for this request',
      );
    }
    return approval;
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
        { companyId, departmentId: undefined, fiscalYear: year },
        ...(departmentId ? [{ companyId, departmentId, fiscalYear: year }] : []),
      ],
    });
    for (const b of budgets) {
      b.reservedAmount = Math.max(0, Number(b.reservedAmount) - amount);
      b.spentAmount = Number(b.spentAmount) + amount;
      await qr.manager.save(CorporateBudget, b);
    }
  }

  private async releaseReservation(
    qr: any,
    companyId: string,
    departmentId: string | undefined,
    amount: number,
  ) {
    const year = new Date().getFullYear();
    const budgets = await this.budgetRepo.find({
      where: [
        { companyId, departmentId: undefined, fiscalYear: year },
        ...(departmentId ? [{ companyId, departmentId, fiscalYear: year }] : []),
      ],
    });
    for (const b of budgets) {
      b.reservedAmount = Math.max(0, Number(b.reservedAmount) - amount);
      await qr.manager.save(CorporateBudget, b);
    }
  }

  // ── History ───────────────────────────────────────────────────────────────

  async getApprovalHistory(requestId: string, companyId: string): Promise<TravelApproval[]> {
    const request = await this.requestRepo.findOne({ where: { id: requestId, companyId } });
    if (!request) throw new NotFoundException(`Travel request "${requestId}" not found`);

    return this.approvalRepo.find({
      where: { requestId },
      order: { stepOrder: 'ASC' },
    });
  }
}
