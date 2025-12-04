import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiPropertyOptional({
    description: 'Tag name',
    example: 'urgent',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  tagName?: string;

  @ApiPropertyOptional({
    description: 'Tag color (hex code)',
    example: '#FF5733',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Tag visibility',
    example: 'public',
    enum: ['public', 'private'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['public', 'private'])
  visibility?: string;
}
