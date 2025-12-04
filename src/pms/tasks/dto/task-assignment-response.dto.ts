import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TaskAssignmentResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Assignment ID',
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
    description: 'User ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  userId: string;

  @Expose()
  @ApiProperty({ description: 'Assignment timestamp' })
  assignedAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Whether this is the primary assignee',
    example: false,
  })
  isPrimary: boolean;

  @Expose()
  @ApiPropertyOptional({ description: 'Assigned user details' })
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}
