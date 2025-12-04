import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TaskQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 50,
    default: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Project ID to filter tasks',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Filter by task status',
    enum: ['to_do', 'in_progress', 'in_review', 'completed', 'blocked'],
    example: 'in_progress',
  })
  @IsOptional()
  @IsEnum(['to_do', 'in_progress', 'in_review', 'completed', 'blocked'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by task priority',
    enum: ['low', 'medium', 'high', 'critical'],
    example: 'high',
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: string;

  @ApiPropertyOptional({
    description: 'Filter by assignee user ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks due from this date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks due until this date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @ApiPropertyOptional({
    description: 'Search in task title and description',
    example: 'design',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: [
      'createdAt',
      'updatedAt',
      'dueDate',
      'priority',
      'status',
      'taskTitle',
    ],
    example: 'dueDate',
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum([
    'createdAt',
    'updatedAt',
    'dueDate',
    'priority',
    'status',
    'taskTitle',
  ])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
