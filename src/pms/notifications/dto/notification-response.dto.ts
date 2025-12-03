import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NotificationResponseDto {
  @Expose()
  @ApiProperty({ description: 'Notification ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'User ID who receives the notification' })
  userId: string;

  @Expose()
  @ApiProperty({ description: 'Notification type', example: 'task_assigned' })
  notificationType: string;

  @Expose()
  @ApiProperty({ description: 'Notification message' })
  message: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Entity type', example: 'task' })
  entityType?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Entity ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  entityId?: string;

  @Expose()
  @ApiProperty({ description: 'Whether the notification is read', example: false })
  isRead: boolean;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

