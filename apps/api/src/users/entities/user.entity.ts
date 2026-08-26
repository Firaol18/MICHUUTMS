import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../account-management/entities/role.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'The unique UUID of the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ApiProperty({ description: 'The role ID of the user', required: false })
  @Column({ type: 'uuid', nullable: true })
  roleId: string;

  @ManyToOne(() => Role, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ApiProperty({ example: '+251 91 123 4567', description: 'Phone number', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @ApiProperty({ example: 'Ethiopia', description: 'Nationality or country', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality?: string;

  @ApiProperty({ description: 'Profile avatar image URL or data URI', required: false })
  @Column({ type: 'text', nullable: true })
  avatarUrl?: string;

  // ── Emergency Contact ──
  @ApiProperty({ description: 'Emergency Contact Name', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  ecName?: string;

  @ApiProperty({ description: 'Emergency Contact Relationship', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ecRelationship?: string;

  @ApiProperty({ description: 'Emergency Contact Phone', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ecPhone?: string;

  @ApiProperty({ description: 'Emergency Contact Email', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  ecEmail?: string;

  // ── Travel Documents ──
  @ApiProperty({ example: 'passport', description: 'Document type', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  passportType?: string;

  @ApiProperty({ description: 'Document number', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  passportNumber?: string;

  @ApiProperty({ description: 'Issuing Country', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  passportCountry?: string;

  @ApiProperty({ description: 'Document expiry date', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  passportExpiry?: string;

  // ── Travel Preferences ──
  @ApiProperty({ description: 'Dietary or medical notes', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  dietaryNeeds?: string;

  @ApiProperty({ description: 'Languages spoken', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  languages?: string;

  @ApiProperty({ description: 'Accessibility requirements', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  accessibility?: string;

  @ApiProperty({ example: 'USD ($)', description: 'Preferred currency', required: false })
  @Column({ type: 'varchar', length: 20, nullable: true })
  preferredCurrency?: string;

  @ApiProperty({ description: 'Preferred accommodation type', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  accommodation?: string;

  @ApiProperty({ description: 'Preferred tour types list', required: false })
  @Column({ type: 'simple-array', nullable: true })
  tourTypes?: string[];

  // ── Security / Auth ──
  @ApiProperty({ description: 'Hashed refresh token stored server-side', required: false })
  @Column({ type: 'text', nullable: true, select: false })
  refreshToken?: string | null;

  @ApiProperty({ description: 'Whether the email address has been verified', required: false })
  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @ApiProperty({ description: 'Single-use email verification token (hashed)', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  emailVerificationToken?: string | null;

  @ApiProperty({ description: 'When the email verification token expires', required: false })
  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpiry?: Date | null;

  @ApiProperty({ description: 'Single-use password reset token (hashed)', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  passwordResetToken?: string | null;

  @ApiProperty({ description: 'When the password reset token expires', required: false })
  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiry?: Date | null;

  @ApiProperty({ description: 'Consecutive failed login attempts counter', required: false })
  @Column({ type: 'int', default: 0 })
  loginAttempts: number;

  @ApiProperty({ description: 'Timestamp until which the account is locked', required: false })
  @Column({ type: 'timestamp', nullable: true })
  lockUntil?: Date | null;

  @ApiProperty({ description: 'User creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'User last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
