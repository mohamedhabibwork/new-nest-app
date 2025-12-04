import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Task title',
    example: 'Design homepage layout updated',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  taskTitle?: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Updated task description',
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    example: 'in_progress',
    enum: ['todo', 'in_progress', 'in_review', 'done', 'blocked'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Task priority',
    example: 'high',
    enum: ['low', 'medium', 'high', 'urgent'],
  })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({
    description: 'Task due date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Estimated hours to complete',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;
}
