import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token received via email',
    example: 'uuid-token-here',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
