import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTourDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() slug: string;
  @ApiProperty() @IsIn(['safari','cultural','beach','mountain','city','luxury']) category: string;
  @ApiProperty() @IsString() summary: string;
  @ApiProperty() @IsString() destinationName: string;
  @ApiProperty() @IsString() destinationCountry: string;
  @ApiProperty() @IsOptional() @IsString() destinationRegion?: string;
  @ApiProperty() @IsOptional() @IsString() destinationImageUrl?: string;
  @ApiProperty() @IsOptional() @IsString() destinationDescription?: string;
  @ApiProperty() @IsNumber() @Min(0) pricePerPerson: number;
  @ApiProperty() @IsOptional() @IsNumber() originalPrice?: number;
  @ApiProperty() @IsOptional() @IsNumber() discountPercent?: number;
  @ApiProperty() @IsNumber() @Min(1) durationDays: number;
  @ApiProperty() @IsNumber() @Min(1) maxGroupSize: number;
  @ApiProperty() @IsIn(['easy','moderate','challenging','extreme']) difficulty: string;
  @ApiProperty() @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty() @IsOptional() @IsArray() galleryImages?: string[];
  @ApiProperty() @IsOptional() @IsArray() included?: string[];
  @ApiProperty() @IsOptional() @IsArray() excluded?: string[];
  @ApiProperty() @IsOptional() @IsArray() itinerary?: object[];
  @ApiProperty() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiProperty() @IsOptional() @IsIn(['active','draft','sold_out']) status?: string;
  @ApiProperty() @IsOptional() @IsString() offerTag?: string;
  @ApiProperty() @IsOptional() @IsBoolean() hasOffer?: boolean;
  @ApiProperty() @IsOptional() @IsString() assignedGuideId?: string;
  @ApiProperty() @IsOptional() @IsString() assignedGuideName?: string;
}

export class QueryToursDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() category?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() search?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() page?: number = 1;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() limit?: number = 20;
  @ApiProperty({ required: false }) @IsOptional() @IsString() status?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() featured?: boolean;
}
