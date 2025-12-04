import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShareDto {
  @ApiPropertyOptional({
    description: 'Permission level',
    example: 'edit',
    enum: ['view', 'edit', 'admin'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['view', 'edit', 'admin'])
  permission?: string;

  @ApiPropertyOptional({
    description: 'Expiration date for the share',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}
