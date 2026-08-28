import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  ValidateNested,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { TravelClass, ApproverType, CorporateRole } from '../enums/corporate.enums';

export class ApprovalStepDto {
  @ApiProperty({ description: '1-based step ordering', example: 1 })
  @IsInt()
  @Min(1)
  stepOrder: number;

  @ApiProperty({ enum: ApproverType })
  @IsEnum(ApproverType)
  approverType: ApproverType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  approverId?: string;

  @ApiProperty({ enum: CorporateRole, required: false })
  @IsOptional()
  @IsEnum(CorporateRole)
  approverRole?: CorporateRole;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ description: 'Auto-escalation timeout in hours', required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  timeoutHours?: number;

  @ApiProperty({ description: 'Step label shown in UI', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;
}

export class CreateTravelPolicyDto {
  @ApiProperty({ example: 'Standard Travel Policy' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxBudgetPerTrip?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxDaysPerTrip?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  advanceBookingDays?: number;

  @ApiProperty({ enum: TravelClass, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(TravelClass, { each: true })
  allowedClasses?: TravelClass[];

  @ApiProperty({ isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDestinations?: string[];

  @ApiProperty({ required: false, description: 'Array of {start, end, reason?} blackout date ranges' })
  @IsOptional()
  blackoutDates?: Array<{ start: string; end: string; reason?: string }>;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  allowBudgetOverride?: boolean;

  @ApiProperty({ type: [ApprovalStepDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStepDto)
  approvalSteps?: ApprovalStepDto[];
}

export class UpdateTravelPolicyDto extends PartialType(CreateTravelPolicyDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
