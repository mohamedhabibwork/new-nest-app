import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TicketQueryDto {
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

  @ApiPropertyOptional({ description: 'Filter by assigned user ID' })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['new', 'open', 'pending', 'resolved', 'closed'],
  })
  @IsEnum(['new', 'open', 'pending', 'resolved', 'closed'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: ['low', 'normal', 'high', 'urgent'],
  })
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Search in subject and description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'updatedAt', 'priority', 'status'],
  })
  @IsEnum(['createdAt', 'updatedAt', 'priority', 'status'])
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
