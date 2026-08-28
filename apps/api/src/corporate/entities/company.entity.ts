import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Department } from './department.entity';
import { CorporateMember } from './corporate-member.entity';
import { TravelPolicy } from './travel-policy.entity';
import { CorporateBudget } from './corporate-budget.entity';
import { TravelRequest } from './travel-request.entity';

@Entity('corporate_companies')
@Index(['isActive'])
export class Company {
  @ApiProperty({ description: 'Unique company UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Acme Corporation', description: 'Full company name' })
  @Column({ type: 'varchar', length: 200, unique: true })
  name: string;

  @ApiProperty({ example: 'ACME', description: 'Short unique company code' })
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @ApiProperty({ example: 'Technology', description: 'Industry sector', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  industry?: string;

  @ApiProperty({ example: 'Ethiopia', description: 'Country of registration', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @ApiProperty({ description: 'Physical address', required: false })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty({ example: 'hr@acme.com', description: 'Primary contact email', required: false })
  @Column({ type: 'varchar', length: 150, nullable: true })
  contactEmail?: string;

  @ApiProperty({ example: '+251911234567', description: 'Primary contact phone', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone?: string;

  @ApiProperty({ description: 'Logo URL or base64 data URI', required: false })
  @Column({ type: 'text', nullable: true })
  logoUrl?: string;

  @ApiProperty({ description: 'Tax or business registration number', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber?: string;

  @ApiProperty({ description: 'Annual travel budget cap (USD)', required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  annualTravelBudget?: number;

  @ApiProperty({ description: 'Preferred currency code', example: 'USD', required: false })
  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Whether the company account is active' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Contract / onboarding start date', required: false })
  @Column({ type: 'date', nullable: true })
  contractStart?: Date;

  @ApiProperty({ description: 'Contract expiry date', required: false })
  @Column({ type: 'date', nullable: true })
  contractEnd?: Date;

  @ApiProperty({ description: 'Internal notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => Department, (d) => d.company, { cascade: false })
  departments: Department[];

  @OneToMany(() => CorporateMember, (m) => m.company, { cascade: false })
  members: CorporateMember[];

  @OneToMany(() => TravelPolicy, (p) => p.company, { cascade: false })
  travelPolicies: TravelPolicy[];

  @OneToMany(() => CorporateBudget, (b) => b.company, { cascade: false })
  budgets: CorporateBudget[];

  @OneToMany(() => TravelRequest, (r) => r.company, { cascade: false })
  travelRequests: TravelRequest[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
