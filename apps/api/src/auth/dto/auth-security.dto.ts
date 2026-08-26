import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Single-use reset token from email link' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePass1!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Single-use verification token from email link' })
  @IsString()
  token: string;
}

export class RefreshTokenDto {
  // refresh token is read from HttpOnly cookie — no body needed
}
