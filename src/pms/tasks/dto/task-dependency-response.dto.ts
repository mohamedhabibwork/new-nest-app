import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TaskDependencyResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Dependency ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Task ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  taskId: string;

  @Expose()
  @ApiProperty({
    description: 'Task ID that this task depends on',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  dependsOnTaskId: string;

  @Expose()
  @ApiProperty({
    description: 'Type of dependency',
    enum: ['blocks', 'blocked_by', 'relates_to'],
  })
  dependencyType: string;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Depends on task details' })
  dependsOnTask?: {
    id: string;
    taskTitle: string;
    status: string;
    priority: string;
  };
}
