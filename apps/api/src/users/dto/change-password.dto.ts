import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  newPassword: string;
}
