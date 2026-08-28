import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsPositive,
  IsUUID,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { TravelClass } from '../enums/corporate.enums';

export class CreateTravelRequestDto {
  @ApiProperty({ example: 'Client Onsite Visit — Nairobi Q4' })
  @IsString()
  @MinLength(3)
  @MaxLength(250)
  title: string;

  @ApiProperty({ description: 'Business purpose / reason for travel' })
  @IsString()
  @MinLength(10)
  purpose: string;

  @ApiProperty({ example: 'Nairobi, Kenya' })
  @IsString()
  @MaxLength(200)
  destination: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin?: string;

  @ApiProperty({ description: 'ISO 8601 departure date', example: '2025-11-15' })
  @IsDateString()
  departureDate: string;

  @ApiProperty({ description: 'ISO 8601 return date', example: '2025-11-20' })
  @IsDateString()
  returnDate: string;

  @ApiProperty({ description: 'Estimated total cost in company currency', example: 2500 })
  @IsNumber()
  @IsPositive()
  estimatedCost: number;

  @ApiProperty({ required: false, default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiProperty({ enum: TravelClass, default: TravelClass.ECONOMY })
  @IsEnum(TravelClass)
  travelClass: TravelClass;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentUrls?: string[];

  @ApiProperty({ description: 'Override policy travel class — requires justification', required: false })
  @IsOptional()
  @IsString()
  budgetOverrideReason?: string;

  @ApiProperty({ description: 'UUID of a specific TravelPolicy to apply', required: false })
  @IsOptional()
  @IsUUID()
  policyId?: string;

  @ApiProperty({ description: 'UUID of a department (if different from member default)', required: false })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}

export class UpdateTravelRequestDto extends PartialType(CreateTravelRequestDto) {}

export class CancelTravelRequestDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsString()
  @MinLength(5)
  reason: string;
}

export class CompleteRequestDto {
  @ApiProperty({ description: 'Optional notes upon trip completion', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class TravelRequestFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  requesterId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
