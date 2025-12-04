import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Enable2FADto {
  // No input required, just call the endpoint
}

export class Verify2FASetupDto {
  @ApiProperty({ description: '6-digit TOTP token from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}

export class Disable2FADto {
  @ApiProperty({ description: 'User password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class Verify2FATokenDto {
  @ApiProperty({ description: '6-digit TOTP token or backup code' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class Verify2FAEmailDto {
  @ApiProperty({ description: '6-digit code sent to email' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}

export class GetBackupCodesDto {
  @ApiProperty({ description: 'User password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
