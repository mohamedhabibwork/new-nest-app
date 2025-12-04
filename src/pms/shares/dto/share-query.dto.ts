import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ShareQueryDto {
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
    description: 'Filter by shareable type',
    example: 'task',
    enum: ['task', 'project', 'ticket'],
  })
  @IsString()
  @IsOptional()
  shareableType?: string;

  @ApiPropertyOptional({
    description: 'Filter by shareable ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  shareableId?: string;

  @ApiPropertyOptional({
    description: 'Filter by shared with type',
    example: 'users',
    enum: ['users', 'teams'],
  })
  @IsString()
  @IsOptional()
  sharedWithType?: string;

  @ApiPropertyOptional({
    description: 'Filter by shared with ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  sharedWithId?: string;

  @ApiPropertyOptional({
    description: 'Filter by permission level',
    example: 'view',
    enum: ['view', 'edit', 'admin'],
  })
  @IsString()
  @IsOptional()
  permission?: string;
}
