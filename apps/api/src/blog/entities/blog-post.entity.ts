import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('blog_posts')
export class BlogPost {
  @ApiProperty() @PrimaryGeneratedColumn('uuid') id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 250 }) title: string;
  @ApiProperty() @Column({ type: 'varchar', length: 260, unique: true }) slug: string;
  @ApiProperty() @Column({ type: 'text' }) excerpt: string;
  @ApiProperty() @Column({ type: 'text' }) content: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) authorName: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, default: '' }) authorAvatarUrl: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, default: '' }) coverImageUrl: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100, default: 'travel' }) category: string;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) tags: string[];
  @ApiProperty() @Column({ type: 'int', default: 0 }) readTimeMinutes: number;
  @ApiProperty() @Column({ type: 'int', default: 0 }) viewCount: number;
  @ApiProperty() @Column({ type: 'boolean', default: false }) isFeatured: boolean;
  @ApiProperty() @Column({ type: 'boolean', default: true }) isPublished: boolean;
  @ApiProperty() @CreateDateColumn() publishedAt: Date;
  @ApiProperty() @UpdateDateColumn() updatedAt: Date;
}
