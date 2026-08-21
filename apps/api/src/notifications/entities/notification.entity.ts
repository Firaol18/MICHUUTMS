import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type NotificationType =
  | 'booking_confirmation'
  | 'payment_confirmation'
  | 'tour_reminder'
  | 'booking_cancellation'
  | 'schedule_change'
  | 'admin_new_booking'
  | 'admin_payment_received'
  | 'admin_cancellation_request'
  | 'issue_resolved'
  | 'issue_rejected'
  | 'issue_update'
  | 'system';

@Entity('notifications')
export class Notification {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200 }) userEmail: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200 }) title: string;
  @ApiProperty() @Column({ type: 'text' }) message: string;
  @ApiProperty() @Column({ type: 'varchar', length: 60 }) type: NotificationType;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'all' }) targetRole: 'customer' | 'admin' | 'all';
  @ApiProperty() @Column({ type: 'varchar', length: 300, nullable: true }) link: string | null;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) bookingRef: string | null;
  @ApiProperty() @Column({ type: 'boolean', default: false }) isRead: boolean;
  @ApiProperty() @CreateDateColumn() timestamp: Date;
}
