import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TravelPolicy } from '../entities/travel-policy.entity';
import { ApprovalStep } from '../entities/approval-step.entity';
import { CreateTravelPolicyDto, UpdateTravelPolicyDto } from '../dto/travel-policy.dto';
import { CompanyService } from './company.service';

@Injectable()
export class TravelPolicyService {
  constructor(
    @InjectRepository(TravelPolicy)
    private readonly policyRepo: Repository<TravelPolicy>,
    @InjectRepository(ApprovalStep)
    private readonly stepRepo: Repository<ApprovalStep>,
    private readonly companyService: CompanyService,
    private readonly dataSource: DataSource,
  ) {}

  async create(companyId: string, dto: CreateTravelPolicyDto): Promise<TravelPolicy> {
    await this.companyService.findOne(companyId);

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // If new policy is marked default, unset existing defaults
      if (dto.isDefault) {
        await qr.manager.update(TravelPolicy, { companyId, isDefault: true }, { isDefault: false });
      }

      const policy = this.policyRepo.create({
        ...dto,
        companyId,
        approvalSteps: undefined,
      });
      const saved = await qr.manager.save(TravelPolicy, policy);

      // Save approval steps if provided
      if (dto.approvalSteps?.length) {
        const steps = dto.approvalSteps.map((s) =>
          this.stepRepo.create({ ...s, policyId: saved.id }),
        );
        await qr.manager.save(ApprovalStep, steps);
      }

      await qr.commitTransaction();
      return this.findOne(saved.id, companyId);
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async findAllByCompany(
    companyId: string,
    query: { isActive?: boolean; page?: number; limit?: number },
  ) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Number(query.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.policyRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.approvalSteps', 's')
      .where('p.companyId = :companyId', { companyId })
      .orderBy('p.isDefault', 'DESC')
      .addOrderBy('p.createdAt', 'DESC');

    if (query.isActive !== undefined) {
      qb.andWhere('p.isActive = :active', { active: String(query.isActive) === 'true' });
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, companyId?: string): Promise<TravelPolicy> {
    const where: any = { id };
    if (companyId) where.companyId = companyId;

    const policy = await this.policyRepo.findOne({
      where,
      relations: ['approvalSteps'],
      order: { approvalSteps: { stepOrder: 'ASC' } },
    });

    if (!policy) throw new NotFoundException(`Travel policy "${id}" not found`);
    return policy;
  }

  async getDefaultPolicy(companyId: string): Promise<TravelPolicy | null> {
    return this.policyRepo.findOne({
      where: { companyId, isDefault: true, isActive: true },
      relations: ['approvalSteps'],
      order: { approvalSteps: { stepOrder: 'ASC' } },
    });
  }

  async update(id: string, companyId: string, dto: UpdateTravelPolicyDto): Promise<TravelPolicy> {
    const policy = await this.findOne(id, companyId);

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      if (dto.isDefault && !policy.isDefault) {
        await qr.manager.update(TravelPolicy, { companyId, isDefault: true }, { isDefault: false });
      }

      const { approvalSteps, ...policyData } = dto;
      this.policyRepo.merge(policy, policyData);
      await qr.manager.save(TravelPolicy, policy);

      // If approval steps provided — replace all
      if (approvalSteps !== undefined) {
        await qr.manager.delete(ApprovalStep, { policyId: id });
        if (approvalSteps.length) {
          const steps = approvalSteps.map((s) =>
            this.stepRepo.create({ ...s, policyId: id }),
          );
          await qr.manager.save(ApprovalStep, steps);
        }
      }

      await qr.commitTransaction();
      return this.findOne(id, companyId);
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async remove(id: string, companyId: string): Promise<void> {
    const policy = await this.findOne(id, companyId);
    if (policy.isDefault) {
      throw new BadRequestException('Cannot delete the default policy. Set another policy as default first.');
    }
    await this.policyRepo.remove(policy);
  }
}
