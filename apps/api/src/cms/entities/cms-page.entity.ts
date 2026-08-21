import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('cms_pages')
export class CmsPage {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 200 }) title: string;
  @ApiProperty() @Column({ type: 'varchar', length: 60 }) type: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, unique: true }) slug: string;
  @ApiProperty() @Column({ type: 'text', default: '' }) content: string;
  @ApiProperty() @Column({ type: 'varchar', length: 20, default: 'published' }) status: 'published' | 'draft';
  @ApiProperty() @CreateDateColumn() createdAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
