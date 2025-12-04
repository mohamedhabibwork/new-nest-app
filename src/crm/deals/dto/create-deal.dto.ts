import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsNumber,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDealDto {
  @ApiProperty({
    description: 'Deal name',
    example: 'Q4 Enterprise Deal',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  dealName: string;

  @ApiPropertyOptional({
    description: 'Contact ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({
    description: 'Company ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({
    description: 'Pipeline ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  pipelineId: string;

  @ApiProperty({
    description: 'Pipeline stage ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  stageId: string;

  @ApiPropertyOptional({
    description: 'Deal amount',
    example: 50000.00,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Currency',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Expected close date',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  closeDate?: Date;

  @ApiPropertyOptional({
    description: 'Probability percentage (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  probability?: number;

  @ApiPropertyOptional({
    description: 'Deal status',
    enum: ['open', 'won', 'lost', 'abandoned'],
    example: 'open',
  })
  @IsEnum(['open', 'won', 'lost', 'abandoned'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Owner user ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Custom properties as JSON object',
  })
  @IsObject()
  @IsOptional()
  customProperties?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Deal notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

