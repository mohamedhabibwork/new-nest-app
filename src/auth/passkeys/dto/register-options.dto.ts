import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterOptionsDto {
  @ApiProperty({
    description: 'Device name for the passkey',
    example: 'iPhone 15 Pro',
  })
  @IsString()
  @IsNotEmpty()
  deviceName: string;
}
