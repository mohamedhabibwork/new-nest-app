import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tag name',
    example: 'urgent',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tagName: string;

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
    default: 'public',
  })
  @IsString()
  @IsOptional()
  @IsEnum(['public', 'private'])
  visibility?: string;
}
