import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class ApproveRequestDto {
  @ApiProperty({ description: 'Optional comment from the approver', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'Grant a budget override when approving over-limit requests', required: false })
  @IsOptional()
  @IsBoolean()
  grantBudgetOverride?: boolean;

  @ApiProperty({ description: 'Justification for budget override', required: false })
  @IsOptional()
  @IsString()
  budgetOverrideReason?: string;
}

export class RejectRequestDto {
  @ApiProperty({ description: 'Reason for rejecting the request (required)' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Optional additional comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateCorporateBudgetDto {
  @ApiProperty({ example: 2025 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  fiscalYear: number;

  @ApiProperty({ required: false, description: '1–4 for quarterly, omit for annual' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  fiscalQuarter?: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsPositive()
  totalBudget: number;

  @ApiProperty({ default: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'UUID of the department (omit for company-wide)', required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class UpdateCorporateBudgetDto extends PartialType(CreateCorporateBudgetDto) {}
