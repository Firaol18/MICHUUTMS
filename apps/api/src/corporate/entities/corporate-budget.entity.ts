import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from './company.entity';
import { Department } from './department.entity';

@Entity('corporate_budgets')
@Index(['companyId', 'fiscalYear'])
@Index(['departmentId', 'fiscalYear'])
export class CorporateBudget {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'UUID of the Company' })
  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ApiProperty({ description: 'UUID of the Department (null = company-wide budget)', required: false })
  @Column({ type: 'uuid', nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @ApiProperty({ description: 'Fiscal year (e.g. 2025)', example: 2025 })
  @Column({ type: 'int' })
  fiscalYear: number;

  @ApiProperty({
    description: 'Fiscal quarter (1–4). Null means annual budget.',
    required: false,
    example: null,
  })
  @Column({ type: 'int', nullable: true })
  fiscalQuarter?: number;

  @ApiProperty({ description: 'Total allocated budget for this period', example: 50000 })
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalBudget: number;

  @ApiProperty({ description: 'Amount already spent (approved + completed requests)', default: 0 })
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  spentAmount: number;

  @ApiProperty({
    description: 'Amount reserved by submitted/under-review requests (not yet approved)',
    default: 0,
  })
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  reservedAmount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Optional notes about this budget allocation', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
