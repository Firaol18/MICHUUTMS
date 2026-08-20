import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';
import { PermissionResource } from './permission-resource.entity';
import { RolePermissionResourceAction } from './role-permission-resource-action.entity';

@Entity('role_permission_resources')
export class RolePermissionResource {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  role_id: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  permission_resource_id: string;

  @ManyToOne(() => Role, (role) => role.rolePermissionResources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => PermissionResource, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_resource_id' })
  resource: PermissionResource;

  @ApiProperty({ type: () => [RolePermissionResourceAction] })
  @OneToMany(() => RolePermissionResourceAction, (rpra) => rpra.rolePermissionResource, { cascade: true })
  rolePermissionResourceActions: RolePermissionResourceAction[];
}
