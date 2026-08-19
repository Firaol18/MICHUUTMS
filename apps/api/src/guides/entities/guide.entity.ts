import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('guides')
export class Guide {
  @ApiProperty() @PrimaryGeneratedColumn() id: number;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) name: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150, unique: true }) email: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50 }) phone: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, default: '' }) avatarUrl: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'Junior Ranger' }) tier: string;
  @ApiProperty() @Column({ type: 'float', default: 5.0 }) rating: number;
  @ApiProperty() @Column({ type: 'int', default: 0 }) toursGuidedCount: number;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) languages: string[];
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) specializations: string[];
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) certifications: object[];
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) availability: object[];
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) paymentHistory: object[];
  @ApiProperty() @Column({ type: 'float', default: 50.0 }) dailyRate: number;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'Available' }) availabilityStatus: string;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'Active' }) status: string;
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
