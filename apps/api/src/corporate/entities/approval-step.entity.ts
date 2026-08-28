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
import { TravelPolicy } from './travel-policy.entity';
import { ApproverType, CorporateRole } from '../enums/corporate.enums';

@Entity('corporate_approval_steps')
@Index(['policyId', 'stepOrder'])
export class ApprovalStep {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Travel Policy this step belongs to' })
  @Column({ type: 'uuid' })
  policyId: string;

  @ManyToOne(() => TravelPolicy, (p) => p.approvalSteps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policyId' })
  policy: TravelPolicy;

  @ApiProperty({ description: '1-based ordering of approval steps', example: 1 })
  @Column({ type: 'int' })
  stepOrder: number;

  @ApiProperty({ enum: ApproverType, description: 'How the approver is resolved' })
  @Column({ type: 'enum', enum: ApproverType, default: ApproverType.DEPARTMENT_MANAGER })
  approverType: ApproverType;

  @ApiProperty({
    description: 'Specific user UUID — only used when approverType = SPECIFIC_USER',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  approverId?: string;

  @ApiProperty({
    enum: CorporateRole,
    description: 'Corporate role that can approve — used when approverType = ROLE',
    required: false,
  })
  @Column({ type: 'enum', enum: CorporateRole, nullable: true })
  approverRole?: CorporateRole;

  @ApiProperty({ description: 'Whether this step must be completed (non-required can be skipped)' })
  @Column({ type: 'boolean', default: true })
  isRequired: boolean;

  @ApiProperty({
    description: 'Hours to wait before auto-escalating to next step. Null = no auto-escalation.',
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  timeoutHours?: number;

  @ApiProperty({ description: 'Label displayed in the UI for this step', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  label?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
