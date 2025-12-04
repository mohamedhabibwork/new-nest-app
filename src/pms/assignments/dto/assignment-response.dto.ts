import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignmentResponseDto {
  @ApiProperty({
    description: 'Assignment ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @ApiProperty({
    description: 'Type of assignable entity',
    example: 'task',
  })
  assignableType: string;

  @ApiProperty({
    description: 'ID of the assignable entity',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  assignableId: string;

  @ApiProperty({
    description: 'ID of the assignee',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  assigneeId: string;

  @ApiProperty({
    description: 'ID of the assigner',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  assignerId: string;

  @ApiProperty({
    description: 'Assignment status',
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
  status: string;

  @ApiProperty({
    description: 'Priority level',
    example: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  priority: string;

  @ApiPropertyOptional({
    description: 'Due date',
    example: '2024-12-31T23:59:59.000Z',
  })
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Notes',
    example: 'Please complete by end of week',
  })
  notes?: string;

  @ApiProperty({
    description: 'Assignment timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  assignedAt: Date;

  @ApiPropertyOptional({
    description: 'Completion timestamp',
    example: '2024-01-15T00:00:00.000Z',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Assignee user details',
  })
  assignee?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };

  @ApiPropertyOptional({
    description: 'Assigner user details',
  })
  assigner?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
