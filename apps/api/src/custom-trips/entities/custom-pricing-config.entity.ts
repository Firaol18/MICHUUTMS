import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('custom_pricing_configs')
export class CustomPricingConfig {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'float', default: 1.4 }) luxuryMultiplier: number;
  @ApiProperty() @Column({ type: 'float', default: 1.0 }) standardMultiplier: number;
  @ApiProperty() @Column({ type: 'float', default: 0.8 }) budgetMultiplier: number;
  @ApiProperty() @Column({ type: 'float', default: 120 }) landcruiserPerDay: number;
  @ApiProperty() @Column({ type: 'float', default: 250 }) flightFixedRate: number;
  @ApiProperty() @Column({ type: 'float', default: 50 }) busFixedRate: number;
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
