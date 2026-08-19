import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '../../bookings/entities/booking.entity';

export type TourCategory = 'safari' | 'cultural' | 'beach' | 'mountain' | 'city' | 'luxury';
export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'extreme';
export type TourStatus = 'active' | 'draft' | 'sold_out';

@Entity('tours')
export class Tour {
  @ApiProperty() @PrimaryGeneratedColumn() id: number;

  @ApiProperty() @Column({ type: 'varchar', length: 200 }) title: string;
  @ApiProperty() @Column({ type: 'varchar', length: 220, unique: true }) slug: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50 }) category: TourCategory;
  @ApiProperty() @Column({ type: 'text' }) summary: string;

  // Destination (flattened)
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) destinationName: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) destinationCountry: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, default: '' }) destinationRegion: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, default: '' }) destinationImageUrl: string;
  @ApiProperty() @Column({ type: 'text', default: '' }) destinationDescription: string;

  @ApiProperty() @Column({ type: 'float' }) pricePerPerson: number;
  @ApiProperty() @Column({ type: 'float', nullable: true }) originalPrice: number;
  @ApiProperty() @Column({ type: 'int', nullable: true }) discountPercent: number;
  @ApiProperty() @Column({ type: 'int' }) durationDays: number;
  @ApiProperty() @Column({ type: 'int' }) maxGroupSize: number;
  @ApiProperty() @Column({ type: 'varchar', length: 50 }) difficulty: DifficultyLevel;
  @ApiProperty() @Column({ type: 'float', default: 5.0 }) rating: number;
  @ApiProperty() @Column({ type: 'int', default: 0 }) reviewCount: number;
  @ApiProperty() @Column({ type: 'varchar', length: 500, default: '' }) imageUrl: string;

  // JSON columns for arrays/objects
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) galleryImages: string[];
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) included: string[];
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) excluded: string[];
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) itinerary: object[];

  @ApiProperty() @Column({ type: 'boolean', default: false }) isFeatured: boolean;
  @ApiProperty() @Column({ type: 'varchar', length: 20, default: 'active' }) status: TourStatus;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) offerTag: string;
  @ApiProperty() @Column({ type: 'boolean', default: false }) hasOffer: boolean;

  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) assignedGuideId: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) assignedGuideName: string;

  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => Booking, (b) => b.tour)
  bookings: Booking[];
}
