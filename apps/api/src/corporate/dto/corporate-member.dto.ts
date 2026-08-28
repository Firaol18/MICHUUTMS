import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CorporateRole } from '../enums/corporate.enums';

export class CreateCorporateMemberDto {
  @ApiProperty({ description: 'UUID of the user to add to the company' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: CorporateRole, default: CorporateRole.TRAVELER })
  @IsEnum(CorporateRole)
  corporateRole: CorporateRole;

  @ApiProperty({ description: 'UUID of the department to assign the member to', required: false })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  jobTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  userName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  userPhone?: string;
}

export class InviteCorporateMemberDto {
  @ApiProperty({ example: 'Dawit Abebe', description: 'Full name of the corporate user' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'dawit@company.com', description: 'Work email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+251911234567', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ description: 'Optional initial password; if omitted, a temporary secure password is generated', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ enum: CorporateRole, default: CorporateRole.TRAVELER })
  @IsEnum(CorporateRole)
  corporateRole: CorporateRole;

  @ApiProperty({ description: 'UUID of the department', required: false })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ example: 'EMP-001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeCode?: string;

  @ApiProperty({ example: 'Senior Travel Coordinator', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  jobTitle?: string;

  @ApiProperty({ description: 'UUID of line manager user', required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;
}

export class UpdateCorporateMemberDto extends PartialType(CreateCorporateMemberDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
