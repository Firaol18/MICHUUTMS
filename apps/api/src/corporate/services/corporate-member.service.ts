import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CorporateMember } from '../entities/corporate-member.entity';
import { Department } from '../entities/department.entity';
import { User } from '../../users/entities/user.entity';
import {
  CreateCorporateMemberDto,
  UpdateCorporateMemberDto,
  InviteCorporateMemberDto,
} from '../dto/corporate-member.dto';
import { CompanyService } from './company.service';
import { CorporateRole } from '../enums/corporate.enums';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CorporateMemberService {
  constructor(
    @InjectRepository(CorporateMember)
    private readonly memberRepo: Repository<CorporateMember>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly companyService: CompanyService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Helper: Generate temporary password if none provided
   */
  private generateTemporaryPassword(): string {
    const prefixes = ['Michuu', 'Habesha', 'Abyssinia', 'Safari', 'Summit'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}#${num}!`;
  }

  /**
   * Directly register/invite a user as a Corporate User and associate with company.
   * Completely separates corporate users in the database by setting companyId, companyName,
   * department, manager, and corporate roleName, while maintaining a relational CorporateMember link.
   */
  async inviteMember(
    companyId: string,
    dto: InviteCorporateMemberDto,
  ): Promise<{ member: CorporateMember; tempPassword: string; isNewUser: boolean }> {
    const company = await this.companyService.findOne(companyId);

    const email = dto.email.toLowerCase().trim();
    let department: Department | null = null;
    if (dto.departmentId) {
      department = await this.deptRepo.findOne({
        where: { id: dto.departmentId, companyId },
      });
    }

    const tempPass = dto.password || this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPass, 10);

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      let user = await qr.manager.findOne(User, { where: { email } });
      let isNewUser = false;

      if (!user) {
        // Create new separated Corporate User account
        isNewUser = true;
        user = this.userRepo.create({
          name: dto.name.trim(),
          email,
          phone: dto.phone,
          password: hashedPassword,
          roleName: dto.corporateRole,
          companyId: company.id,
          companyName: company.name,
          departmentId: department?.id,
          departmentName: department?.name,
          managerId: dto.managerId,
          isActive: true,
          emailVerified: true,
        });
        user = await qr.manager.save(User, user);
      } else {
        // User already exists — update their corporate association
        user.companyId = company.id;
        user.companyName = company.name;
        if (department) {
          user.departmentId = department.id;
          user.departmentName = department.name;
        }
        if (dto.managerId) {
          user.managerId = dto.managerId;
        }
        user.roleName = dto.corporateRole;
        await qr.manager.save(User, user);
      }

      // Check if CorporateMember already exists
      let member = await qr.manager.findOne(CorporateMember, {
        where: { userId: user.id, companyId: company.id },
      });

      if (!member) {
        member = this.memberRepo.create({
          userId: user.id,
          companyId: company.id,
          departmentId: department?.id,
          corporateRole: dto.corporateRole,
          employeeCode: dto.employeeCode,
          jobTitle: dto.jobTitle,
          userName: dto.name.trim(),
          userEmail: email,
          isActive: true,
        });
      } else {
        member.corporateRole = dto.corporateRole;
        if (department) member.departmentId = department.id;
        if (dto.employeeCode) member.employeeCode = dto.employeeCode;
        if (dto.jobTitle) member.jobTitle = dto.jobTitle;
        member.userName = dto.name.trim();
        member.userEmail = email;
        member.isActive = true;
      }

      const savedMember = await qr.manager.save(CorporateMember, member);
      await qr.commitTransaction();

      const populated = await this.findOne(savedMember.id, companyId);
      return {
        member: populated,
        tempPassword: tempPass,
        isNewUser,
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async addMember(companyId: string, dto: CreateCorporateMemberDto): Promise<CorporateMember> {
    await this.companyService.findOne(companyId);

    const exists = await this.memberRepo.findOne({
      where: { userId: dto.userId, companyId },
    });
    if (exists) {
      throw new ConflictException('User is already a member of this company');
    }

    const member = this.memberRepo.create({ ...dto, companyId });
    return this.memberRepo.save(member);
  }

  async findAllByCompany(
    companyId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      corporateRole?: CorporateRole;
      departmentId?: string;
      isActive?: boolean;
    },
  ) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
    const skip = (page - 1) * limit;

    const qb = this.memberRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.department', 'd')
      .where('m.companyId = :companyId', { companyId })
      .orderBy('m.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(LOWER(m.userName) LIKE :s OR LOWER(m.userEmail) LIKE :s OR LOWER(m.employeeCode) LIKE :s)',
        { s: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.corporateRole) {
      qb.andWhere('m.corporateRole = :role', { role: query.corporateRole });
    }

    if (query.departmentId) {
      qb.andWhere('m.departmentId = :deptId', { deptId: query.departmentId });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('m.isActive = :active', { active: String(query.isActive) === 'true' });
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, companyId?: string): Promise<CorporateMember> {
    const where: any = { id };
    if (companyId) where.companyId = companyId;
    const m = await this.memberRepo.findOne({ where, relations: ['company', 'department'] });
    if (!m) throw new NotFoundException(`Corporate member with ID "${id}" not found`);
    return m;
  }

  async findByUserId(userId: string, companyId?: string): Promise<CorporateMember[]> {
    const where: any = { userId, isActive: true };
    if (companyId) where.companyId = companyId;
    return this.memberRepo.find({ where, relations: ['company', 'department'] });
  }

  async update(id: string, companyId: string, dto: UpdateCorporateMemberDto): Promise<CorporateMember> {
    const member = await this.findOne(id, companyId);
    this.memberRepo.merge(member, dto);
    return this.memberRepo.save(member);
  }

  async changeRole(id: string, companyId: string, role: CorporateRole): Promise<CorporateMember> {
    const member = await this.findOne(id, companyId);
    member.corporateRole = role;
    return this.memberRepo.save(member);
  }

  async deactivate(id: string, companyId: string): Promise<CorporateMember> {
    const member = await this.findOne(id, companyId);
    member.isActive = false;
    return this.memberRepo.save(member);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const member = await this.findOne(id, companyId);
    await this.memberRepo.remove(member);
  }

  async getCompanyRoleSummary(companyId: string) {
    const rows = await this.memberRepo
      .createQueryBuilder('m')
      .where('m.companyId = :companyId AND m.isActive = true', { companyId })
      .select(['m.corporateRole AS role', 'COUNT(m.id) AS count'])
      .groupBy('m.corporateRole')
      .getRawMany();

    return rows.reduce((acc, r) => {
      acc[r.role] = Number(r.count);
      return acc;
    }, {} as Record<string, number>);
  }
}
