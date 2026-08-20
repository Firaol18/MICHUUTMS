import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('issues')
export class Issue {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 20, unique: true }) ticketId: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) reportedBy: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150 }) email: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) issueType: string;
  @ApiProperty() @Column({ type: 'text' }) description: string;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'open' }) status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  @ApiProperty() @Column({ type: 'text', nullable: true }) adminReason: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) resolvedBy: string;
  @ApiProperty() @Column({ type: 'timestamp', nullable: true }) resolvedAt: Date;
  @ApiProperty() @Column({ type: 'uuid', nullable: true }) userId: string;
  @ApiProperty() @CreateDateColumn() dateReported: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
