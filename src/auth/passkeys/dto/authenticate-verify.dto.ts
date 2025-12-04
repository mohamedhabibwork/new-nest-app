import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class AuthenticateVerifyDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Authentication response from the authenticator',
    type: Object,
    additionalProperties: true,
  })
  @IsObject()
  @IsNotEmpty()
  response: Record<string, unknown>;
}
