import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('agency_settings')
export class AgencySettings {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200, default: 'MICHUU Tourism & Travel Management' }) agencyName: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150, default: 'concierge@michuutours.et' }) contactEmail: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'ETB (Br) / USD ($)' }) currency: string;
  @ApiProperty() @Column({ type: 'int', default: 25 }) depositPercent: number;
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
