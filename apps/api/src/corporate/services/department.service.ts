import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';
import { CompanyService } from './company.service';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    private readonly companyService: CompanyService,
  ) {}

  async create(companyId: string, dto: CreateDepartmentDto): Promise<Department> {
    // Verify company exists
    await this.companyService.findOne(companyId);

    // Enforce unique name within a company
    const exists = await this.departmentRepo.findOne({
      where: { companyId, name: dto.name },
    });
    if (exists) {
      throw new ConflictException(`Department "${dto.name}" already exists in this company`);
    }

    const dept = this.departmentRepo.create({ ...dto, companyId });
    return this.departmentRepo.save(dept);
  }

  async findAllByCompany(
    companyId: string,
    query: { page?: number; limit?: number; search?: string; isActive?: boolean },
  ) {
    await this.companyService.findOne(companyId);

    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 50)));
    const skip = (page - 1) * limit;

    const qb = this.departmentRepo
      .createQueryBuilder('d')
      .where('d.companyId = :companyId', { companyId })
      .orderBy('d.name', 'ASC');

    if (query.search) {
      qb.andWhere('(LOWER(d.name) LIKE :s OR LOWER(d.code) LIKE :s)', {
        s: `%${query.search.toLowerCase()}%`,
      });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('d.isActive = :active', { active: String(query.isActive) === 'true' });
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, companyId?: string): Promise<Department> {
    const where: any = { id };
    if (companyId) where.companyId = companyId;

    const dept = await this.departmentRepo.findOne({
      where,
      relations: ['company'],
    });
    if (!dept) {
      throw new NotFoundException(`Department with ID "${id}" not found`);
    }
    return dept;
  }

  async update(id: string, companyId: string, dto: UpdateDepartmentDto): Promise<Department> {
    const dept = await this.findOne(id, companyId);

    if (dto.name && dto.name !== dept.name) {
      const exists = await this.departmentRepo.findOne({ where: { companyId, name: dto.name } });
      if (exists) throw new ConflictException(`Department name "${dto.name}" is already in use`);
    }

    this.departmentRepo.merge(dept, dto);
    return this.departmentRepo.save(dept);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const dept = await this.findOne(id, companyId);
    await this.departmentRepo.remove(dept);
  }

  async getMemberCount(departmentId: string): Promise<number> {
    return this.departmentRepo
      .createQueryBuilder('d')
      .leftJoin('d.members', 'm')
      .where('d.id = :departmentId AND m.isActive = true', { departmentId })
      .select('COUNT(m.id)', 'cnt')
      .getRawOne()
      .then((r) => Number(r?.cnt ?? 0));
  }
}
