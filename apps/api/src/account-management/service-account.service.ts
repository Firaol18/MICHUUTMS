import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceAccount } from './entities/service-account.entity';
import { CreateServiceAccountDto, UpdateServiceAccountDto } from './dto/service-account.dto';
import * as crypto from 'crypto';

@Injectable()
export class ServiceAccountService {
  constructor(
    @InjectRepository(ServiceAccount)
    private readonly serviceAccountRepository: Repository<ServiceAccount>,
  ) {}

  async create(createServiceAccountDto: CreateServiceAccountDto): Promise<ServiceAccount> {
    const clientId = createServiceAccountDto.clientId || `sa_${crypto.randomBytes(8).toString('hex')}`;
    
    const existing = await this.serviceAccountRepository.findOne({ where: { clientId } });
    if (existing) {
      throw new BadRequestException('Service account with this Client ID already exists');
    }

    const clientSecret = createServiceAccountDto.clientSecret || `sec_${crypto.randomBytes(16).toString('hex')}`;

    const serviceAccount = this.serviceAccountRepository.create({
      ...createServiceAccountDto,
      clientId,
      clientSecret,
    });

    return (await this.serviceAccountRepository.save(serviceAccount)) as ServiceAccount;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    roleId?: string;
  }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const queryBuilder = this.serviceAccountRepository.createQueryBuilder('sa')
      .leftJoinAndSelect('sa.role', 'role')
      .orderBy('sa.createdAt', 'DESC');

    if (query.search) {
      queryBuilder.andWhere(
        '(LOWER(sa.name) LIKE :search OR LOWER(sa.clientId) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` }
      );
    }

    if (query.isActive !== undefined) {
      const activeVal = String(query.isActive) === 'true';
      queryBuilder.andWhere('sa.isActive = :isActive', { isActive: activeVal });
    }

    if (query.roleId) {
      queryBuilder.andWhere('sa.roleId = :roleId', { roleId: query.roleId });
    }

    const [items, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ServiceAccount> {
    const sa = await this.serviceAccountRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!sa) {
      throw new NotFoundException(`Service account with ID ${id} not found`);
    }
    return sa;
  }

  async update(id: string, updateDto: UpdateServiceAccountDto): Promise<ServiceAccount> {
    const sa = await this.findOne(id);
    this.serviceAccountRepository.merge(sa, updateDto);
    return this.serviceAccountRepository.save(sa);
  }

  async remove(id: string): Promise<void> {
    const sa = await this.findOne(id);
    await this.serviceAccountRepository.remove(sa);
  }
}
