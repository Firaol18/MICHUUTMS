import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('custom_trips')
export class CustomTrip {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) name: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150 }) email: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: '' }) phone: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200 }) destination: string;
  @ApiProperty() @Column({ type: 'int' }) durationDays: number;
  @ApiProperty() @Column({ type: 'int' }) groupSize: number;
  @ApiProperty() @Column({ type: 'date' }) preferredStartDate: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'mid-range' }) budget: string;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) interests: string[];
  @ApiProperty() @Column({ type: 'text', nullable: true }) specialRequirements: string;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'pending' }) status: 'pending' | 'reviewing' | 'quoted' | 'confirmed' | 'cancelled';
  @ApiProperty() @Column({ type: 'uuid', nullable: true }) userId: string;
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
