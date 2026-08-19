import { IsString, IsNumber, IsOptional, IsArray, Min, IsIn, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty() @IsNumber() tourId: number;
  @ApiProperty() @IsString() tourTitle: string;
  @ApiProperty() @IsString() destinationName: string;
  @ApiProperty() traveler: {
    name: string; email: string; phone: string;
    nationality: string; specialRequests?: string;
  };
  @ApiProperty() @IsDateString() travelDate: string;
  @ApiProperty() @IsNumber() @Min(1) numberOfTravelers: number;
  @ApiProperty() @IsOptional() @IsNumber() numberOfAdults?: number;
  @ApiProperty() @IsOptional() @IsNumber() numberOfChildren?: number;
}

export class CancelBookingDto {
  @ApiProperty() @IsString() reason: string;
  @ApiProperty() @IsOptional() requestRefund?: boolean;
}
