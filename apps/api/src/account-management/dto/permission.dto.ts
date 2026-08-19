import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreatePermissionActionDto {
  @ApiProperty({ example: 'Create' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ example: 'Ability to create records' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  draft?: boolean;
}

export class UpdatePermissionActionDto extends PartialType(CreatePermissionActionDto) {}

export class CreatePermissionResourceDto {
  @ApiProperty({ example: 'Employee' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Employee records resource' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  draft?: boolean;
}

export class UpdatePermissionResourceDto extends PartialType(CreatePermissionResourceDto) {}
