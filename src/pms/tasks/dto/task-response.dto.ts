import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { TaskAssignmentResponseDto } from './task-assignment-response.dto';
import { TaskDependencyResponseDto } from './task-dependency-response.dto';
import { ChecklistItemResponseDto } from './checklist-item-response.dto';

export class TaskResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Task ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Project ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  projectId: string;

  @Expose()
  @ApiProperty({ description: 'Task title', example: 'Design homepage layout' })
  taskTitle: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Task description' })
  description?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Task status', example: 'todo' })
  status?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Task priority', example: 'high' })
  priority?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Task due date' })
  dueDate?: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Estimated hours', example: 8 })
  estimatedHours?: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Parent task ID' })
  parentTaskId?: string;

  @Expose()
  @ApiProperty({ description: 'Creator user ID' })
  createdBy: string;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional({
    description: 'Task assignments',
    type: [TaskAssignmentResponseDto],
  })
  @Type(() => TaskAssignmentResponseDto)
  taskAssignments?: TaskAssignmentResponseDto[];

  @Expose()
  @ApiPropertyOptional({
    description: 'Task dependencies',
    type: [TaskDependencyResponseDto],
  })
  @Type(() => TaskDependencyResponseDto)
  taskDependencies?: TaskDependencyResponseDto[];

  @Expose()
  @ApiPropertyOptional({
    description: 'Checklist items',
    type: [ChecklistItemResponseDto],
  })
  @Type(() => ChecklistItemResponseDto)
  checklistItems?: ChecklistItemResponseDto[];
}
