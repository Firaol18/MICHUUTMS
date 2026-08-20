import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tour } from '../../tours/entities/tour.entity';
import { User } from '../../users/entities/user.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'refunded';
export type RefundStatus = 'none' | 'pending' | 'processed' | 'denied';

@Entity('bookings')
export class Booking {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;

  @ApiProperty() @Column({ type: 'varchar', length: 50, unique: true }) bookingReference: string;

  // Tour relation (nullable — guest bookings may reference tours not yet in DB)
  @ApiProperty() @Column({ type: 'uuid', nullable: true }) tourId: string | null;
  @ManyToOne(() => Tour, (t) => t.bookings, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'tourId' })
  tour: Tour;

  @ApiProperty() @Column({ type: 'varchar', length: 200 }) tourTitle: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200 }) destinationName: string;

  // User relation (nullable so guest bookings are allowed)
  @ApiProperty() @Column({ type: 'uuid', nullable: true }) userId: string | null;
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Traveler info (stored as JSON)
  @ApiProperty() @Column({ type: 'jsonb' }) traveler: {
    name: string;
    email: string;
    phone: string;
    nationality: string;
    specialRequests?: string;
  };

  @ApiProperty() @Column({ type: 'date' }) travelDate: string;
  @ApiProperty() @Column({ type: 'int' }) numberOfTravelers: number;
  @ApiProperty() @Column({ type: 'int', default: 1 }) numberOfAdults: number;
  @ApiProperty() @Column({ type: 'int', default: 0 }) numberOfChildren: number;
  @ApiProperty() @Column({ type: 'float' }) totalPrice: number;

  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'pending' }) status: BookingStatus;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'unpaid' }) paymentStatus: PaymentStatus;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'none' }) refundStatus: RefundStatus;

  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) assignedGuideId?: string | null;
  @ApiProperty() @Column({ type: 'varchar', length: 100, nullable: true }) assignedGuideName?: string | null;
  @ApiProperty() @Column({ type: 'text', nullable: true }) cancellationReason?: string | null;

  @ApiProperty() @CreateDateColumn() bookingDate: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
