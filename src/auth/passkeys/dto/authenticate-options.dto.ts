import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AuthenticateOptionsDto {
  @ApiProperty({
    description: 'User email for authentication',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
