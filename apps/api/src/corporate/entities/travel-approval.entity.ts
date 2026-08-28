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
import { TravelRequest } from './travel-request.entity';
import { ApprovalDecision } from '../enums/corporate.enums';

@Entity('corporate_travel_approvals')
@Index(['requestId', 'stepOrder'])
@Index(['approverId', 'decision'])
export class TravelApproval {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'UUID of the parent TravelRequest' })
  @Column({ type: 'uuid' })
  requestId: string;

  @ManyToOne(() => TravelRequest, (r) => r.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: TravelRequest;

  @ApiProperty({ description: 'UUID of the User who is (or was) the approver' })
  @Column({ type: 'uuid' })
  approverId: string;

  @ApiProperty({ description: 'Denormalized approver display name' })
  @Column({ type: 'varchar', length: 150, nullable: true })
  approverName?: string;

  @ApiProperty({ description: '1-based step number matching ApprovalStep.stepOrder' })
  @Column({ type: 'int' })
  stepOrder: number;

  @ApiProperty({ enum: ApprovalDecision, description: 'Current decision at this step' })
  @Column({ type: 'enum', enum: ApprovalDecision, default: ApprovalDecision.PENDING })
  decision: ApprovalDecision;

  @ApiProperty({ description: 'Approver comment or rejection justification', required: false })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ApiProperty({ description: 'Timestamp when the approver acted on this step', required: false })
  @Column({ type: 'timestamp', nullable: true })
  decidedAt?: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
