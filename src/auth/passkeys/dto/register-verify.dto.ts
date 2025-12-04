import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class RegisterVerifyDto {
  @ApiProperty({
    description: 'Device name for the passkey',
    example: 'iPhone 15 Pro',
  })
  @IsString()
  @IsNotEmpty()
  deviceName: string;

  @ApiProperty({
    description: 'Registration response from the authenticator',
    type: Object,
    additionalProperties: true,
  })
  @IsObject()
  @IsNotEmpty()
  response: Record<string, unknown>;
}
