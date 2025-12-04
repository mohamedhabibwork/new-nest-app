import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CommentQueryDto {
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
    description: 'Filter by commentable type',
    example: 'task',
    enum: ['task', 'project', 'ticket'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['task', 'project', 'ticket'])
  commentableType?: string;

  @ApiPropertyOptional({
    description: 'Filter by commentable ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsOptional()
  @IsString()
  commentableId?: string;

  @ApiPropertyOptional({
    description: 'Include deleted comments',
    example: false,
    default: false,
  })
  @IsOptional()
  includeDeleted?: boolean = false;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'updatedAt'],
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc',
    default: 'asc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
