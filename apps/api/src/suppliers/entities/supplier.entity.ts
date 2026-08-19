import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('suppliers')
export class Supplier {
  @ApiProperty() @PrimaryGeneratedColumn() id: number;
  @ApiProperty() @Column({ type: 'varchar', length: 150 }) name: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: 'Hotel / Resort' }) category: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, default: 'Addis Ababa' }) location: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) contactPerson: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150 }) email: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50 }) phone: string;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'Active' }) status: string;
  @ApiProperty() @Column({ type: 'float', default: 5.0 }) rating: number;
  @ApiProperty() @Column({ type: 'varchar', length: 100, default: 'Net 30 Days' }) paymentTerms: string;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) contracts: object[];
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
