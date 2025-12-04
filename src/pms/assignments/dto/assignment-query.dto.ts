import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssignmentQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 50,
    minimum: 1,
    default: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by assignable type',
    example: 'task',
    enum: ['task', 'project', 'ticket'],
  })
  @IsString()
  @IsOptional()
  assignableType?: string;

  @ApiPropertyOptional({
    description: 'Filter by assignable ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  assignableId?: string;

  @ApiPropertyOptional({
    description: 'Filter by assignee ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'pending',
    enum: [
      'pending',
      'accepted',
      'in_progress',
      'completed',
      'blocked',
      'declined',
    ],
  })
  @IsString()
  @IsOptional()
  @IsEnum([
    'pending',
    'accepted',
    'in_progress',
    'completed',
    'blocked',
    'declined',
  ])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    example: 'high',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: string;
}
