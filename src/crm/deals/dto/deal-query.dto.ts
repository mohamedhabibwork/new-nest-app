import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DealQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 50,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by contact ID' })
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Filter by pipeline ID' })
  @IsString()
  @IsOptional()
  pipelineId?: string;

  @ApiPropertyOptional({ description: 'Filter by stage ID' })
  @IsString()
  @IsOptional()
  stageId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['open', 'won', 'lost', 'abandoned'],
  })
  @IsEnum(['open', 'won', 'lost', 'abandoned'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by owner ID' })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Filter deals with close date from' })
  @IsDateString()
  @IsOptional()
  closeDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter deals with close date to' })
  @IsDateString()
  @IsOptional()
  closeDateTo?: string;

  @ApiPropertyOptional({ description: 'Search in deal name and notes' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'updatedAt', 'closeDate', 'amount', 'probability'],
  })
  @IsEnum(['createdAt', 'updatedAt', 'closeDate', 'amount', 'probability'])
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
