import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiPropertyOptional() @IsOptional() @IsString() tourId?: string;
  @ApiProperty() @IsString() tourTitle: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bookingRef?: string;
  @ApiProperty() @IsString() authorName: string;
  @ApiProperty() @IsString() authorEmail: string;
  @ApiPropertyOptional() @IsOptional() @IsString() avatarUrl?: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(5) overallRating: number;
  @ApiProperty() @IsNumber() @Min(1) @Max(5) guideRating: number;
  @ApiPropertyOptional() @IsOptional() @IsString() guideName?: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(5) transportRating: number;
  @ApiProperty() @IsNumber() @Min(1) @Max(5) accommodationRating: number;
  @ApiProperty() @IsString() comment: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() rating?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVerifiedBooking?: boolean;
}
