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
  @ApiProperty() @Column({ type: 'float', nullable: true, default: 0 }) price: number;
  @ApiProperty() @Column({ type: 'boolean', default: false }) isFree: boolean;
  @ApiProperty() @Column({ type: 'boolean', default: true }) isActive: boolean;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'upcoming' }) status: string;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) tags: string[];
  // Offer / discount fields
  @ApiProperty() @Column({ type: 'boolean', default: false }) hasOffer: boolean;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) offerTag: string | null;
  @ApiProperty() @Column({ type: 'float', nullable: true }) discountPercent: number | null;
  @ApiProperty() @Column({ type: 'float', nullable: true }) originalPrice: number | null;
  @ApiProperty({ default: 50, required: false }) @Column({ type: 'int', default: 50 }) capacity: number;
  @ApiProperty({ required: false }) bookedSeats?: number;
  @ApiProperty({ required: false }) availableSlots?: number;

  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
