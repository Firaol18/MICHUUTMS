import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('custom_destinations')
export class CustomDestination {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150 }) name: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) region: string;
  @ApiProperty() @Column({ type: 'float', default: 150 }) pricePerDay: number;
  @ApiProperty() @Column({ type: 'varchar', length: 500, default: '' }) image: string;
  @ApiProperty() @Column({ type: 'text', nullable: true }) description: string;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) highlights: string[];
  @ApiProperty() @Column({ type: 'boolean', default: true }) isActive: boolean;
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
