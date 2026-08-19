import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionResource } from './entities/permission-resource.entity';
import { PermissionAction } from './entities/permission-action.entity';
import {
  CreatePermissionResourceDto,
  UpdatePermissionResourceDto,
  CreatePermissionActionDto,
  UpdatePermissionActionDto,
} from './dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionResource)
    private readonly resourceRepository: Repository<PermissionResource>,
    @InjectRepository(PermissionAction)
    private readonly actionRepository: Repository<PermissionAction>,
  ) {}

  // ---------- Resources ----------

  async createResource(dto: CreatePermissionResourceDto): Promise<PermissionResource> {
    const existing = await this.resourceRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`Resource '${dto.name}' already exists`);
    }
    const res = this.resourceRepository.create(dto);
    return this.resourceRepository.save(res);
  }

  async findAllResources(): Promise<PermissionResource[]> {
    return this.resourceRepository.find({ order: { id: 'ASC' } });
  }

  async updateResource(id: number, dto: UpdatePermissionResourceDto): Promise<PermissionResource> {
    const res = await this.resourceRepository.findOne({ where: { id } });
    if (!res) throw new NotFoundException('Resource not found');
    this.resourceRepository.merge(res, dto);
    return this.resourceRepository.save(res);
  }

  async removeResource(id: number): Promise<void> {
    const res = await this.resourceRepository.findOne({ where: { id } });
    if (!res) throw new NotFoundException('Resource not found');
    await this.resourceRepository.remove(res);
  }

  // ---------- Actions ----------

  async createAction(dto: CreatePermissionActionDto): Promise<PermissionAction> {
    const existing = await this.actionRepository.findOne({ where: { action: dto.action } });
    if (existing) {
      throw new BadRequestException(`Action '${dto.action}' already exists`);
    }
    const act = this.actionRepository.create(dto);
    return this.actionRepository.save(act);
  }

  async findAllActions(): Promise<PermissionAction[]> {
    return this.actionRepository.find({ order: { id: 'ASC' } });
  }

  async updateAction(id: number, dto: UpdatePermissionActionDto): Promise<PermissionAction> {
    const act = await this.actionRepository.findOne({ where: { id } });
    if (!act) throw new NotFoundException('Action not found');
    this.actionRepository.merge(act, dto);
    return this.actionRepository.save(act);
  }

  async removeAction(id: number): Promise<void> {
    const act = await this.actionRepository.findOne({ where: { id } });
    if (!act) throw new NotFoundException('Action not found');
    await this.actionRepository.remove(act);
  }
}
