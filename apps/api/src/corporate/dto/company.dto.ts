import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsDateString,
  MaxLength,
  MinLength,
  IsPositive,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'ACME', description: 'Short unique code (max 20 chars)' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  annualTravelBudget?: number;

  @ApiProperty({ default: 'USD', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  contractStart?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  contractEnd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  // ── Optional Initial Corporate Admin ──
  @ApiProperty({ required: false, description: 'Initial Corporate Admin name' })
  @IsOptional()
  @IsString()
  adminName?: string;

  @ApiProperty({ required: false, description: 'Initial Corporate Admin email' })
  @IsOptional()
  @IsEmail()
  adminEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  adminPhone?: string;

  @ApiProperty({ required: false, description: 'Temporary password for initial Corporate Admin' })
  @IsOptional()
  @IsString()
  adminPassword?: string;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
