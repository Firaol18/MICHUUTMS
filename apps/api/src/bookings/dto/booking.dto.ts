import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiPropertyOptional() @IsOptional() tourId?: number | string;
  @ApiPropertyOptional() @IsOptional() @IsString() tourTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destinationName?: string;
  @ApiPropertyOptional() @IsOptional() traveler?: {
    name?: string;
    email?: string;
    phone?: string;
    nationality?: string;
    specialRequests?: string;
  };
  @ApiPropertyOptional() @IsOptional() travelDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) numberOfTravelers?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() numberOfAdults?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() numberOfChildren?: number;
}

export class CancelBookingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() requestRefund?: boolean;
}

