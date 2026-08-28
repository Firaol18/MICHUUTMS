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
import { ApprovalStep } from './approval-step.entity';
import { TravelClass } from '../enums/corporate.enums';

@Entity('corporate_travel_policies')
@Index(['companyId', 'isActive'])
@Index(['companyId', 'isDefault'])
export class TravelPolicy {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Company this policy belongs to' })
  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.travelPolicies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ApiProperty({ example: 'Standard Travel Policy', description: 'Policy name' })
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({ description: 'Human-readable description of the policy', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Whether this is the default policy applied to new requests' })
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @ApiProperty({ description: 'Whether travel requests require approval before booking' })
  @Column({ type: 'boolean', default: true })
  requiresApproval: boolean;

  @ApiProperty({ description: 'Maximum budget allowed per trip (in company currency)', required: false })
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  maxBudgetPerTrip?: number;

  @ApiProperty({ description: 'Maximum trip duration in days', required: false })
  @Column({ type: 'int', nullable: true })
  maxDaysPerTrip?: number;

  @ApiProperty({
    description: 'Minimum advance booking lead time in days (0 = same-day allowed)',
    required: false,
  })
  @Column({ type: 'int', nullable: true, default: 0 })
  advanceBookingDays?: number;

  @ApiProperty({
    enum: TravelClass,
    isArray: true,
    description: 'Allowed travel classes. Empty array means all classes allowed.',
    example: ['ECONOMY', 'BUSINESS'],
  })
  @Column({ type: 'simple-array', nullable: true })
  allowedClasses?: TravelClass[];

  @ApiProperty({
    isArray: true,
    description: 'Whitelisted destination countries/cities. Empty means all destinations allowed.',
    required: false,
  })
  @Column({ type: 'simple-array', nullable: true })
  allowedDestinations?: string[];

  @ApiProperty({
    description: 'JSON array of blackout date ranges: [{start: "YYYY-MM-DD", end: "YYYY-MM-DD", reason: "..."}]',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  blackoutDates?: Array<{ start: string; end: string; reason?: string }>;

  @ApiProperty({ description: 'Allow manager to override budget cap with justification' })
  @Column({ type: 'boolean', default: true })
  allowBudgetOverride: boolean;

  @ApiProperty({ description: 'Whether this policy is active' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ApprovalStep, (s) => s.policy, { cascade: true, eager: false })
  approvalSteps: ApprovalStep[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
