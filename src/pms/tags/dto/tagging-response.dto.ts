import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaggingResponseDto {
  @ApiProperty({
    description: 'Tagging ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @ApiProperty({
    description: 'Tag ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  tagId: string;

  @ApiProperty({
    description: 'Type of taggable entity',
    example: 'task',
  })
  taggableType: string;

  @ApiProperty({
    description: 'ID of the taggable entity',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  taggableId: string;

  @ApiProperty({
    description: 'ID of the user who created the tagging',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  createdById: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Tag details',
  })
  tag?: {
    id: string;
    tagName: string;
    color?: string;
  };

  @ApiPropertyOptional({
    description: 'Creator user details',
  })
  createdBy?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
