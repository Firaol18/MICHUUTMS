import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role } from './entities/role.entity';
import { RolePermissionResource } from './entities/role-permission-resource.entity';
import { RolePermissionResourceAction } from './entities/role-permission-resource-action.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermissionResource)
    private readonly rolePermissionResourceRepository: Repository<RolePermissionResource>,
    @InjectRepository(RolePermissionResourceAction)
    private readonly rolePermissionResourceActionRepository: Repository<RolePermissionResourceAction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { rolePermissionResources, ...roleData } = createRoleDto;
      
      const role = this.roleRepository.create(roleData);
      const savedRole = await queryRunner.manager.save(Role, role);

      if (rolePermissionResources && rolePermissionResources.length > 0) {
        for (const resDto of rolePermissionResources) {
          const rpr = this.rolePermissionResourceRepository.create({
            role_id: savedRole.id,
            permission_resource_id: resDto.permission_resource_id,
          });
          const savedRpr = await queryRunner.manager.save(RolePermissionResource, rpr) as RolePermissionResource;

          if (resDto.rolePermissionResourceActions && resDto.rolePermissionResourceActions.length > 0) {
            const actionsToSave = resDto.rolePermissionResourceActions.map((actDto) => {
              return this.rolePermissionResourceActionRepository.create({
                role_permission_resource_id: savedRpr.id,
                permission_action_id: actDto.permission_action_id,
              });
            });
            await queryRunner.manager.save(RolePermissionResourceAction, actionsToSave);
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedRole.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: [
        'rolePermissionResources',
        'rolePermissionResources.resource',
        'rolePermissionResources.rolePermissionResourceActions',
        'rolePermissionResources.rolePermissionResourceActions.action',
      ],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: [
        'rolePermissionResources',
        'rolePermissionResources.resource',
        'rolePermissionResources.rolePermissionResourceActions',
        'rolePermissionResources.rolePermissionResourceActions.action',
      ],
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (role.isLocked) {
      throw new BadRequestException('Locked roles cannot be modified');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { rolePermissionResources, ...roleData } = updateRoleDto;
      
      // Update role attributes
      this.roleRepository.merge(role, roleData);
      await queryRunner.manager.save(Role, role);

      if (rolePermissionResources !== undefined) {
        // Delete existing relations (cascades actions)
        await queryRunner.manager.delete(RolePermissionResource, { role_id: id });
        
        if (rolePermissionResources.length > 0) {
          for (const resDto of rolePermissionResources) {
            const rpr = this.rolePermissionResourceRepository.create({
              role_id: id,
              permission_resource_id: resDto.permission_resource_id,
            });
            const savedRpr = await queryRunner.manager.save(RolePermissionResource, rpr) as RolePermissionResource;

            if (resDto.rolePermissionResourceActions && resDto.rolePermissionResourceActions.length > 0) {
              const actionsToSave = resDto.rolePermissionResourceActions.map((actDto) => {
                return this.rolePermissionResourceActionRepository.create({
                  role_permission_resource_id: savedRpr.id,
                  permission_action_id: actDto.permission_action_id,
                });
              });
              await queryRunner.manager.save(RolePermissionResourceAction, actionsToSave);
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    if (!role.editable) {
      throw new BadRequestException('This role is not editable/deletable');
    }
    await this.roleRepository.remove(role);
  }
}
