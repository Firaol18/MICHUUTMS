import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsArray, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRolePermissionResourceActionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  permission_action_id: number;
}

export class CreateRolePermissionResourceDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  permission_resource_id: number;

  @ApiProperty({ type: [CreateRolePermissionResourceActionDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRolePermissionResourceActionDto)
  rolePermissionResourceActions: CreateRolePermissionResourceActionDto[];
}

export class CreateRoleDto {
  @ApiProperty({ example: 'Manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Manages department operations' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  editable: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  switchable: boolean;

  @ApiProperty({ type: [CreateRolePermissionResourceDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRolePermissionResourceDto)
  rolePermissionResources: CreateRolePermissionResourceDto[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
