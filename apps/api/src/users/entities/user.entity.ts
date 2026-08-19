import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../account-management/entities/role.entity';

@Entity('users') // Table name
export class User {
  @ApiProperty({ example: 1, description: 'The unique ID of the user' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Sam', description: 'The name of the user' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ example: 'sam@example.com', description: 'The email of the user' })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @ApiProperty({ example: 'password123', description: 'The hashed password of the user' })
  @Column({ type: 'varchar', select: false })
  password: string;

  @ApiProperty({ example: true, description: 'Whether the user is active', required: false })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ example: 1, description: 'The role ID of the user', required: false })
  @Column({ nullable: true })
  roleId: number;

  @ManyToOne(() => Role, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ApiProperty({ example: '2025-12-15T12:00:00Z', description: 'User creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-12-15T12:05:00Z', description: 'User last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}

