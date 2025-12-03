import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Project ID that owns this task',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Design homepage layout',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  taskTitle: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Create a modern and responsive homepage layout',
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    example: 'todo',
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
    example: 8,
  })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: 'Parent task ID for subtasks',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  parentTaskId?: string;
}

