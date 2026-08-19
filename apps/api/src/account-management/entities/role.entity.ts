import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RolePermissionResource } from './role-permission-resource.entity';

@Entity('roles')
export class Role {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  isLocked: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  editable: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  switchable: boolean;

  @ApiProperty({ type: () => [RolePermissionResource] })
  @OneToMany(() => RolePermissionResource, (rolePermissionResource) => rolePermissionResource.role, { cascade: true })
  rolePermissionResources: RolePermissionResource[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
