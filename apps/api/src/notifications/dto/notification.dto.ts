import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty() @IsString() userEmail: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() message: string;
  @ApiProperty() @IsString() type: string;
  @ApiPropertyOptional() @IsOptional() @IsString() targetRole?: 'customer' | 'admin' | 'all';
  @ApiPropertyOptional() @IsOptional() @IsString() link?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bookingRef?: string;
}

export class MarkReadDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRead?: boolean;
}
