import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateServiceAccountDto {
  @ApiProperty({ example: 'CI/CD Service Account' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ci-cd-client-id', required: false })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ example: 'client-secret-key-123', required: false })
  @IsString()
  @IsOptional()
  clientSecret?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  roleId?: number;
}

export class UpdateServiceAccountDto extends PartialType(CreateServiceAccountDto) {}
