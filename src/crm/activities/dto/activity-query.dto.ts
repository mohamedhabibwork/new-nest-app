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

export class ActivityQueryDto {
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

  @ApiPropertyOptional({ description: 'Filter by deal ID' })
  @IsString()
  @IsOptional()
  dealId?: string;

  @ApiPropertyOptional({
    description: 'Filter by activity type',
    enum: ['email', 'call', 'meeting', 'note', 'task'],
  })
  @IsEnum(['email', 'call', 'meeting', 'note', 'task'])
  @IsOptional()
  activityType?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by direction',
    enum: ['inbound', 'outbound'],
  })
  @IsEnum(['inbound', 'outbound'])
  @IsOptional()
  direction?: string;

  @ApiPropertyOptional({ description: 'Filter activities from this date' })
  @IsDateString()
  @IsOptional()
  activityDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter activities until this date' })
  @IsDateString()
  @IsOptional()
  activityDateTo?: string;

  @ApiPropertyOptional({ description: 'Search in subject and description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'activityDate'],
  })
  @IsEnum(['createdAt', 'activityDate'])
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
