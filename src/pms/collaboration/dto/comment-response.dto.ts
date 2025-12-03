import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CommentResponseDto {
  @Expose()
  @ApiProperty({ description: 'Comment ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  taskId: string;

  @Expose()
  @ApiProperty({ description: 'User ID who created the comment' })
  userId: string;

  @Expose()
  @ApiProperty({ description: 'Comment text' })
  commentText: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
  parentCommentId?: string;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

