import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('reviews')
export class Review {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150, nullable: true }) tourId: string | null;
  @ApiProperty() @Column({ type: 'varchar', length: 300 }) tourTitle: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) bookingRef: string | null;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) authorName: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150 }) authorEmail: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, nullable: true }) avatarUrl: string | null;
  @ApiProperty() @Column({ type: 'float', default: 5.0 }) overallRating: number;
  @ApiProperty() @Column({ type: 'float', default: 5.0 }) guideRating: number;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) guideName: string | null;
  @ApiProperty() @Column({ type: 'float', default: 5.0 }) transportRating: number;
  @ApiProperty() @Column({ type: 'float', default: 5.0 }) accommodationRating: number;
  @ApiProperty() @Column({ type: 'text' }) comment: string;
  @ApiProperty() @Column({ type: 'boolean', default: false }) isVerifiedBooking: boolean;
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
