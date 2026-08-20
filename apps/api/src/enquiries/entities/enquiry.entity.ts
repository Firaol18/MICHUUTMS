import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('enquiries')
export class Enquiry {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) name: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150 }) email: string;
  @ApiProperty() @Column({ type: 'varchar', length: 50, default: '' }) mobile: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200 }) subject: string;
  @ApiProperty() @Column({ type: 'text' }) message: string;
  @ApiProperty() @Column({ type: 'varchar', length: 20, default: 'unread' }) status: 'unread' | 'read' | 'replied';
  @ApiProperty() @CreateDateColumn() date: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
