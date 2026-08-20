import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('vehicles')
export class Vehicle {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150 }) vehicleName: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, unique: true }) plateNumber: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) model: string;
  @ApiProperty() @Column({ type: 'int', default: 2024 }) year: number;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: '4x4 Cruiser' }) type: string;
  @ApiProperty() @Column({ type: 'int', default: 7 }) capacity: number;
  @ApiProperty() @Column({ type: 'varchar', length: 100, default: '' }) assignedDriver: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'Available' }) status: string;
  @ApiProperty() @Column({ type: 'int', default: 15000 }) nextServiceKm: number;
  @ApiProperty() @Column({ type: 'int', default: 10000 }) currentMileageKm: number;
  @ApiProperty() @Column({ type: 'float', default: 0 }) lastServiceCostUsd: number;
  @ApiProperty() @Column({ type: 'date', nullable: true }) insuranceExpiry: string;
  @ApiProperty() @Column({ type: 'date', nullable: true }) inspectionExpiry: string;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) maintenanceHistory: object[];
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
