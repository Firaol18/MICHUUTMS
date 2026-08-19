import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('payments')
export class Payment {
  @ApiProperty() @PrimaryGeneratedColumn() id: number;
  @ApiProperty() @Column({ type: 'varchar', length: 50, unique: true }) transactionRef: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50 }) bookingRef: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) customerName: string;
  @ApiProperty() @Column({ type: 'float' }) amount: number;
  @ApiProperty() @Column({ type: 'varchar', length: 10, default: 'ETB' }) currency: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'Telebirr' }) paymentMethod: string;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'paid' }) status: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, default: 'Tour Booking Deposit' }) description: string;
  @ApiProperty() @CreateDateColumn() paymentDate: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
