import { IsString, IsNotEmpty, IsEmail, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Verify2FALoginDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Temporary token received from login endpoint' })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({
    description: '6-digit TOTP token, backup code, or email code',
  })
  @IsString()
  @IsNotEmpty()
  twoFactorToken: string;

  @ApiPropertyOptional({
    description: 'Whether to use email code instead of TOTP token',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  useEmailCode?: boolean;
}
