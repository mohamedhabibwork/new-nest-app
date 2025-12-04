import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Type of commentable entity (task, project, ticket, etc.)',
    example: 'task',
    enum: ['task', 'project', 'ticket'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['task', 'project', 'ticket'])
  commentableType: string;

  @ApiProperty({
    description: 'ID of the commentable entity',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  commentableId: string;

  @ApiProperty({
    description: 'Comment text',
    example: 'This task looks good, but we need to add more details.',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  commentText: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID for replies',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  parentCommentId?: string;
}
