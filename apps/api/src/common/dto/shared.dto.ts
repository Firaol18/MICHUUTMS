import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsDateString() eventDate: string;
  @ApiProperty() @IsOptional() @IsDateString() endDate?: string;
  @ApiProperty() @IsString() location: string;
  @ApiProperty() @IsOptional() @IsString() category?: string;
  @ApiProperty() @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty() @IsOptional() @IsNumber() price?: number;
  @ApiProperty() @IsOptional() @IsBoolean() isFree?: boolean;
  @ApiProperty() @IsOptional() @IsArray() tags?: string[];
}

export class CreateBlogPostDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() slug: string;
  @ApiProperty() @IsString() excerpt: string;
  @ApiProperty() @IsString() content: string;
  @ApiProperty() @IsString() authorName: string;
  @ApiProperty() @IsOptional() @IsString() authorAvatarUrl?: string;
  @ApiProperty() @IsOptional() @IsString() coverImageUrl?: string;
  @ApiProperty() @IsOptional() @IsString() category?: string;
  @ApiProperty() @IsOptional() @IsArray() tags?: string[];
  @ApiProperty() @IsOptional() @IsNumber() readTimeMinutes?: number;
  @ApiProperty() @IsOptional() @IsBoolean() isFeatured?: boolean;
}

export class CreateEnquiryDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() email: string;
  @ApiProperty() @IsOptional() @IsString() mobile?: string;
  @ApiProperty() @IsString() subject: string;
  @ApiProperty() @IsString() message: string;
}

export class CreateIssueDto {
  @ApiProperty() @IsString() reportedBy: string;
  @ApiProperty() @IsString() email: string;
  @ApiProperty() @IsString() issueType: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsOptional() @IsNumber() userId?: number;
}

export class CreateCustomTripDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() email: string;
  @ApiProperty() @IsOptional() @IsString() phone?: string;
  @ApiProperty() @IsString() destination: string;
  @ApiProperty() @IsNumber() durationDays: number;
  @ApiProperty() @IsNumber() groupSize: number;
  @ApiProperty() @IsDateString() preferredStartDate: string;
  @ApiProperty() @IsOptional() @IsString() budget?: string;
  @ApiProperty() @IsOptional() @IsArray() interests?: string[];
  @ApiProperty() @IsOptional() @IsString() specialRequirements?: string;
  @ApiProperty() @IsOptional() @IsNumber() userId?: number;
}
