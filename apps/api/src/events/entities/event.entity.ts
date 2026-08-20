import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('events')
export class Event {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200 }) title: string;
  @ApiProperty() @Column({ type: 'text' }) description: string;
  @ApiProperty() @Column({ type: 'date' }) eventDate: string;
  @ApiProperty() @Column({ type: 'date', nullable: true }) endDate: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200 }) location: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, default: 'cultural' }) category: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, default: '' }) imageUrl: string;
  @ApiProperty() @Column({ type: 'float', nullable: true }) price: number;
  @ApiProperty() @Column({ type: 'boolean', default: false }) isFree: boolean;
  @ApiProperty() @Column({ type: 'boolean', default: true }) isActive: boolean;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'upcoming' }) status: string;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) tags: string[];
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
