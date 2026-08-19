import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('expenses')
export class Expense {
  @ApiProperty() @PrimaryGeneratedColumn() id: number;
  @ApiProperty() @Column({ type: 'varchar', length: 50, unique: true }) expenseNumber: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) category: string;
  @ApiProperty() @Column({ type: 'text' }) description: string;
  @ApiProperty() @Column({ type: 'float' }) amount: number;
  @ApiProperty() @Column({ type: 'varchar', length: 10, default: 'ETB' }) currency: string;
  @ApiProperty() @Column({ type: 'date' }) expenseDate: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, default: 'General' }) department: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) recordedBy: string;
  @ApiProperty() @Column({ type: 'varchar', length: 30, default: 'approved' }) status: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, nullable: true }) receiptUrl: string;
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
