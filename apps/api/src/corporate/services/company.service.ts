import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Company } from '../entities/company.entity';
import { CorporateMember } from '../entities/corporate-member.entity';
import { User } from '../../users/entities/user.entity';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto/company.dto';
import { CorporateRole } from '../enums/corporate.enums';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(CorporateMember)
    private readonly memberRepo: Repository<CorporateMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateCompanyDto): Promise<{ company: Company; initialAdmin?: { id: string; name: string; email: string; tempPassword?: string } }> {
    const existingName = await this.companyRepo.findOne({ where: { name: dto.name } });
    if (existingName) {
      throw new ConflictException(`Company with name "${dto.name}" already exists`);
    }

    const existingCode = await this.companyRepo.findOne({ where: { code: dto.code.toUpperCase() } });
    if (existingCode) {
      throw new ConflictException(`Company with code "${dto.code}" already exists`);
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const company = this.companyRepo.create({
        name: dto.name.trim(),
        code: dto.code.toUpperCase().trim(),
        industry: dto.industry,
        country: dto.country,
        address: dto.address,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        logoUrl: dto.logoUrl,
        registrationNumber: dto.registrationNumber,
        annualTravelBudget: dto.annualTravelBudget,
        currency: dto.currency ?? 'USD',
        notes: dto.notes,
        contractStart: dto.contractStart ? new Date(dto.contractStart) : undefined,
        contractEnd: dto.contractEnd ? new Date(dto.contractEnd) : undefined,
        isActive: true,
      });

      const savedCompany = await qr.manager.save(Company, company);
      let initialAdminResult: { id: string; name: string; email: string; tempPassword?: string } | undefined;

      // Automatically provision initial Corporate Admin if specified
      if (dto.adminEmail && dto.adminName) {
        const adminEmail = dto.adminEmail.toLowerCase().trim();
        const tempPass = dto.adminPassword || 'Michuu#2026!';
        const hashedPassword = await bcrypt.hash(tempPass, 10);

        let user = await qr.manager.findOne(User, { where: { email: adminEmail } });
        if (!user) {
          user = this.userRepo.create({
            name: dto.adminName.trim(),
            email: adminEmail,
            phone: dto.adminPhone,
            password: hashedPassword,
            roleName: CorporateRole.CORPORATE_ADMIN,
            companyId: savedCompany.id,
            companyName: savedCompany.name,
            isActive: true,
            emailVerified: true,
          });
          user = await qr.manager.save(User, user);
        } else {
          await qr.manager.update(User, user.id, {
            name: dto.adminName.trim(),
            password: hashedPassword,
            companyId: savedCompany.id,
            companyName: savedCompany.name,
            roleName: CorporateRole.CORPORATE_ADMIN,
            isActive: true,
            loginAttempts: 0,
            lockUntil: null,
          });
        }

        const member = this.memberRepo.create({
          userId: user.id,
          companyId: savedCompany.id,
          corporateRole: CorporateRole.CORPORATE_ADMIN,
          jobTitle: 'Corporate Administrator',
          userName: dto.adminName.trim(),
          userEmail: adminEmail,
          isActive: true,
        });
        await qr.manager.save(CorporateMember, member);

        initialAdminResult = {
          id: user.id,
          name: dto.adminName.trim(),
          email: adminEmail,
          tempPassword: tempPass,
        };
      }

      await qr.commitTransaction();
      return { company: savedCompany, initialAdmin: initialAdminResult };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    industry?: string;
  }) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const skip = (page - 1) * limit;

    const qb = this.companyRepo
      .createQueryBuilder('c')
      .orderBy('c.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere('(LOWER(c.name) LIKE :s OR LOWER(c.code) LIKE :s OR LOWER(c.contactEmail) LIKE :s)', {
        s: `%${query.search.toLowerCase()}%`,
      });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('c.isActive = :active', { active: String(query.isActive) === 'true' });
    }

    if (query.industry) {
      qb.andWhere('LOWER(c.industry) = :industry', { industry: query.industry.toLowerCase() });
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: ['departments', 'travelPolicies'],
    });
    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
    return company;
  }

  async findByCode(code: string): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { code: code.toUpperCase() } });
    if (!company) {
      throw new NotFoundException(`Company with code "${code}" not found`);
    }
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);

    if (dto.name && dto.name !== company.name) {
      const exists = await this.companyRepo.findOne({ where: { name: dto.name } });
      if (exists) throw new ConflictException(`Company name "${dto.name}" is already taken`);
    }

    if (dto.code && dto.code.toUpperCase() !== company.code) {
      const exists = await this.companyRepo.findOne({ where: { code: dto.code.toUpperCase() } });
      if (exists) throw new ConflictException(`Company code "${dto.code}" is already taken`);
      dto = { ...dto, code: dto.code.toUpperCase() };
    }

    this.companyRepo.merge(company, dto);
    return this.companyRepo.save(company);
  }

  async deactivate(id: string): Promise<Company> {
    const company = await this.findOne(id);
    company.isActive = false;
    return this.companyRepo.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companyRepo.remove(company);
  }

  async getStats(id: string) {
    const company = await this.findOne(id);
    const memberCount = await this.companyRepo
      .createQueryBuilder('c')
      .leftJoin('c.members', 'm')
      .where('c.id = :id', { id })
      .select('COUNT(m.id)', 'memberCount')
      .getRawOne();

    const requestStats = await this.companyRepo
      .createQueryBuilder('c')
      .leftJoin('c.travelRequests', 'r')
      .where('c.id = :id', { id })
      .select([
        'COUNT(r.id) AS totalRequests',
        `SUM(CASE WHEN r.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved`,
        `SUM(CASE WHEN r.status = 'PENDING' OR r.status = 'SUBMITTED' OR r.status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) AS pending`,
        `SUM(CASE WHEN r.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected`,
        `SUM(CASE WHEN r.status = 'APPROVED' THEN r."estimatedCost" ELSE 0 END) AS totalSpend`,
      ])
      .getRawOne();

    return {
      company,
      memberCount: Number(memberCount?.memberCount ?? 0),
      requests: {
        total: Number(requestStats?.totalRequests ?? 0),
        approved: Number(requestStats?.approved ?? 0),
        pending: Number(requestStats?.pending ?? 0),
        rejected: Number(requestStats?.rejected ?? 0),
        totalSpend: Number(requestStats?.totalSpend ?? 0),
      },
    };
  }
}
