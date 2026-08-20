import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('drivers')
export class Driver {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) name: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) licenseNumber: string;
  @ApiProperty() @Column({ type: 'date' }) licenseExpiry: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) licenseCategory: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200, default: '' }) assignedVehicle: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50 }) phone: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150 }) email: string;
  @ApiProperty() @Column({ type: 'int', default: 5 }) experienceYears: number;
  @ApiProperty() @Column({ type: 'float', default: 50 }) dailyRate: number;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'Available' }) availability: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'Active' }) status: string;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) schedule: object[];
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
