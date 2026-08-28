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
import { Department } from './department.entity';
import { TravelPolicy } from './travel-policy.entity';
import { TravelApproval } from './travel-approval.entity';
import { RequestStatus, TravelClass } from '../enums/corporate.enums';

@Entity('corporate_travel_requests')
@Index(['companyId', 'status'])
@Index(['requesterId', 'status'])
@Index(['departmentId', 'status'])
@Index(['departureDate'])
@Index(['createdAt'])
export class TravelRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'UUID of the User who submitted this request' })
  @Column({ type: 'uuid' })
  requesterId: string;

  @ApiProperty({ description: 'Denormalized requester name' })
  @Column({ type: 'varchar', length: 150, nullable: true })
  requesterName?: string;

  @ApiProperty({ description: 'UUID of the Company' })
  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.travelRequests, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ApiProperty({ description: 'UUID of the Department', required: false })
  @Column({ type: 'uuid', nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @ApiProperty({ description: 'UUID of the TravelPolicy applied', required: false })
  @Column({ type: 'uuid', nullable: true })
  policyId?: string;

  @ManyToOne(() => TravelPolicy, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'policyId' })
  policy?: TravelPolicy;

  @ApiProperty({ example: 'Client Onsite Visit — Nairobi Q4', description: 'Short trip title' })
  @Column({ type: 'varchar', length: 250 })
  title: string;

  @ApiProperty({ description: 'Business purpose / reason for travel' })
  @Column({ type: 'text' })
  purpose: string;

  @ApiProperty({ example: 'Nairobi, Kenya', description: 'Primary destination' })
  @Column({ type: 'varchar', length: 200 })
  destination: string;

  @ApiProperty({ description: 'Origin city or location', required: false })
  @Column({ type: 'varchar', length: 200, nullable: true })
  origin?: string;

  @ApiProperty({ description: 'Departure date (ISO 8601)' })
  @Column({ type: 'date' })
  departureDate: Date;

  @ApiProperty({ description: 'Return date (ISO 8601)' })
  @Column({ type: 'date' })
  returnDate: Date;

  @ApiProperty({ description: 'Estimated total cost in company currency' })
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  estimatedCost: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @ApiProperty({ enum: TravelClass, description: 'Requested travel class' })
  @Column({ type: 'enum', enum: TravelClass, default: TravelClass.ECONOMY })
  travelClass: TravelClass;

  @ApiProperty({ enum: RequestStatus, description: 'Current lifecycle status' })
  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.DRAFT })
  status: RequestStatus;

  @ApiProperty({ description: 'Index (0-based) of the current approval step in progress', default: 0 })
  @Column({ type: 'int', default: 0 })
  currentApprovalStep: number;

  @ApiProperty({ description: 'Additional notes from requester', required: false })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Array of attachment URLs or base64 data URIs', required: false })
  @Column({ type: 'simple-array', nullable: true })
  attachmentUrls?: string[];

  @ApiProperty({ description: 'Reason provided when the request was rejected', required: false })
  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @ApiProperty({ description: 'Whether a budget override was granted', required: false })
  @Column({ type: 'boolean', default: false })
  budgetOverride: boolean;

  @ApiProperty({ description: 'Justification text for budget override', required: false })
  @Column({ type: 'text', nullable: true })
  budgetOverrideReason?: string;

  @ApiProperty({ description: 'When the request was finally approved', required: false })
  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: 'When the trip was completed', required: false })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @OneToMany(() => TravelApproval, (a) => a.request, { cascade: true, eager: false })
  approvals: TravelApproval[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
