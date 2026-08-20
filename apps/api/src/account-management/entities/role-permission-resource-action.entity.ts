import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RolePermissionResource } from './role-permission-resource.entity';
import { PermissionAction } from './permission-action.entity';

@Entity('role_permission_resource_actions')
export class RolePermissionResourceAction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  role_permission_resource_id: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  permission_action_id: string;

  @ManyToOne(() => RolePermissionResource, (rpr) => rpr.rolePermissionResourceActions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_permission_resource_id' })
  rolePermissionResource: RolePermissionResource;

  @ManyToOne(() => PermissionAction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_action_id' })
  action: PermissionAction;
}
