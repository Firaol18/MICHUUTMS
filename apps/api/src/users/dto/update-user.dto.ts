import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'sam@example.com',
    description: 'Updated email address',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewPassword@123',
    description: 'Updated password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Activate or deactivate user',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '+251 91 123 4567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Ethiopia' })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ecName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ecRelationship?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ecPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ecEmail?: string;

  @ApiPropertyOptional({ example: 'passport' })
  @IsString()
  @IsOptional()
  passportType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  passportNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  passportCountry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  passportExpiry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dietaryNeeds?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  languages?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accessibility?: string;

  @ApiPropertyOptional({ example: 'USD ($)' })
  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accommodation?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  tourTypes?: string[];
}
