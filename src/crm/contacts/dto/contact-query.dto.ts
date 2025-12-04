import { IsOptional, IsString, IsEnum, IsInt, Min, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ContactQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 50, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by lifecycle stage',
    enum: ['lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist', 'other'],
  })
  @IsEnum(['lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist', 'other'])
  @IsOptional()
  lifecycleStage?: string;

  @ApiPropertyOptional({
    description: 'Filter by lead status',
    enum: ['new', 'contacted', 'qualified', 'unqualified', 'lost'],
  })
  @IsEnum(['new', 'contacted', 'qualified', 'unqualified', 'lost'])
  @IsOptional()
  leadStatus?: string;

  @ApiPropertyOptional({ description: 'Filter by owner ID' })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Filter by lead source' })
  @IsString()
  @IsOptional()
  leadSource?: string;

  @ApiPropertyOptional({ description: 'Search in name, email, phone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum lead score' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minLeadScore?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum lead score' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxLeadScore?: number;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'updatedAt', 'lastContacted', 'leadScore', 'email', 'firstName', 'lastName'],
  })
  @IsEnum(['createdAt', 'updatedAt', 'lastContacted', 'leadScore', 'email', 'firstName', 'lastName'])
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Include deleted contacts' })
  @IsOptional()
  includeDeleted?: boolean;
}

