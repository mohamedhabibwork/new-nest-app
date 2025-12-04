import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CommentResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Comment ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Type of commentable entity', example: 'task' })
  commentableType: string;

  @Expose()
  @ApiProperty({
    description: 'ID of the commentable entity',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  commentableId: string;

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
  @ApiProperty({ description: 'Is deleted flag', default: false })
  isDeleted: boolean;

  @Expose()
  @ApiPropertyOptional({ description: 'Deletion timestamp' })
  deletedAt?: Date;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'User who created the comment' })
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };

  @Expose()
  @ApiPropertyOptional({ description: 'Replies to this comment' })
  replies?: CommentResponseDto[];

  @Expose()
  @ApiPropertyOptional({ description: 'Mentions in this comment' })
  mentions?: Array<{
    id: string;
    mentionedUserId: string;
    mentionedUser?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
  }>;
}
