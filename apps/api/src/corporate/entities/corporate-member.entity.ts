import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { CorporateRole } from '../enums/corporate.enums';

@Entity('corporate_members')
@Unique(['userId', 'companyId'])
@Index(['companyId', 'isActive'])
@Index(['companyId', 'corporateRole'])
@Index(['departmentId'])
export class CorporateMember {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'UUID of the linked User account' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'UUID of the Company' })
  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ApiProperty({ description: 'UUID of the Department', required: false })
  @Column({ type: 'uuid', nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, (d) => d.members, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @ApiProperty({ enum: CorporateRole, description: 'Role within the corporate account' })
  @Column({ type: 'enum', enum: CorporateRole, default: CorporateRole.TRAVELER })
  corporateRole: CorporateRole;

  @ApiProperty({ example: 'EMP-001', description: 'Internal employee code', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  employeeCode?: string;

  @ApiProperty({ example: 'Senior Engineer', description: 'Job title within the company', required: false })
  @Column({ type: 'varchar', length: 150, nullable: true })
  jobTitle?: string;

  @ApiProperty({ description: 'Denormalized user display name', required: false })
  @Column({ type: 'varchar', length: 150, nullable: true })
  userName?: string;

  @ApiProperty({ description: 'Denormalized user email', required: false })
  @Column({ type: 'varchar', length: 150, nullable: true })
  userEmail?: string;

  @ApiProperty({ description: 'Whether this membership is active' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'When this member was invited/joined' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
