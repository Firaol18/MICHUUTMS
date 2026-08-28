import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorporateBudget } from '../entities/corporate-budget.entity';
import { CreateCorporateBudgetDto, UpdateCorporateBudgetDto } from '../dto/approval-budget.dto';
import { CompanyService } from './company.service';

@Injectable()
export class CorporateBudgetService {
  constructor(
    @InjectRepository(CorporateBudget)
    private readonly budgetRepo: Repository<CorporateBudget>,
    private readonly companyService: CompanyService,
  ) {}

  async create(companyId: string, dto: CreateCorporateBudgetDto): Promise<CorporateBudget> {
    await this.companyService.findOne(companyId);

    // Check for duplicate (same company+dept+year+quarter)
    const existing = await this.budgetRepo.findOne({
      where: {
        companyId,
        departmentId: dto.departmentId ?? undefined,
        fiscalYear: dto.fiscalYear,
        fiscalQuarter: dto.fiscalQuarter ?? undefined,
      },
    });
    if (existing) {
      throw new ConflictException('A budget record already exists for this period and scope. Update it instead.');
    }

    const budget = this.budgetRepo.create({
      ...dto,
      companyId,
      spentAmount: 0,
      reservedAmount: 0,
      currency: dto.currency ?? 'USD',
    });
    return this.budgetRepo.save(budget);
  }

  async findAllByCompany(
    companyId: string,
    query: { fiscalYear?: number; departmentId?: string; page?: number; limit?: number },
  ) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Number(query.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.budgetRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.department', 'd')
      .where('b.companyId = :companyId', { companyId })
      .orderBy('b.fiscalYear', 'DESC')
      .addOrderBy('b.fiscalQuarter', 'ASC');

    if (query.fiscalYear) {
      qb.andWhere('b.fiscalYear = :year', { year: query.fiscalYear });
    }
    if (query.departmentId) {
      qb.andWhere('b.departmentId = :deptId', { deptId: query.departmentId });
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    // Enrich with utilization percentage
    const enriched = items.map((b) => ({
      ...b,
      utilizationPercent:
        Number(b.totalBudget) > 0
          ? Math.round((Number(b.spentAmount) / Number(b.totalBudget)) * 100)
          : 0,
      availableAmount: Math.max(
        0,
        Number(b.totalBudget) - Number(b.spentAmount) - Number(b.reservedAmount),
      ),
    }));

    return { items: enriched, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, companyId: string): Promise<CorporateBudget> {
    const b = await this.budgetRepo.findOne({
      where: { id, companyId },
      relations: ['department'],
    });
    if (!b) throw new NotFoundException(`Budget record "${id}" not found`);
    return b;
  }

  async update(id: string, companyId: string, dto: UpdateCorporateBudgetDto): Promise<CorporateBudget> {
    const budget = await this.findOne(id, companyId);
    this.budgetRepo.merge(budget, dto as any);
    return this.budgetRepo.save(budget);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const budget = await this.findOne(id, companyId);
    await this.budgetRepo.remove(budget);
  }

  async getSummary(companyId: string, fiscalYear: number) {
    const budgets = await this.budgetRepo
      .createQueryBuilder('b')
      .where('b.companyId = :companyId AND b.fiscalYear = :year', { companyId, year: fiscalYear })
      .getMany();

    const total = budgets.reduce((s, b) => s + Number(b.totalBudget), 0);
    const spent = budgets.reduce((s, b) => s + Number(b.spentAmount), 0);
    const reserved = budgets.reduce((s, b) => s + Number(b.reservedAmount), 0);
    const available = Math.max(0, total - spent - reserved);

    return {
      fiscalYear,
      totalBudget: total,
      spentAmount: spent,
      reservedAmount: reserved,
      availableAmount: available,
      utilizationPercent: total > 0 ? Math.round((spent / total) * 100) : 0,
      budgetCount: budgets.length,
    };
  }
}
