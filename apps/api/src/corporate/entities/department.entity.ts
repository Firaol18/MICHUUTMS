import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from './company.entity';
import { CorporateMember } from './corporate-member.entity';

@Entity('corporate_departments')
@Index(['companyId', 'isActive'])
@Index(['companyId', 'name'])
export class Department {
  @ApiProperty({ description: 'Unique department UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Parent company UUID' })
  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.departments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ApiProperty({ example: 'Engineering', description: 'Department name' })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty({ example: 'ENG', description: 'Short department code', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  code?: string;

  @ApiProperty({ description: 'UUID of the User who manages this department', required: false })
  @Column({ type: 'uuid', nullable: true })
  managerId?: string;

  @ApiProperty({ description: 'Name of the department manager (denormalized)', required: false })
  @Column({ type: 'varchar', length: 150, nullable: true })
  managerName?: string;

  @ApiProperty({ description: 'Annual travel budget limit for this department (in company currency)', required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  budgetLimit?: number;

  @ApiProperty({ description: 'Short description of the department', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Whether this department is active' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => CorporateMember, (m) => m.department, { cascade: false })
  members: CorporateMember[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
