import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({
    description: 'Tag ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @ApiProperty({
    description: 'Tag name',
    example: 'urgent',
  })
  tagName: string;

  @ApiPropertyOptional({
    description: 'Tag color',
    example: '#FF5733',
  })
  color?: string;

  @ApiProperty({
    description: 'Creator ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  creatorId: string;

  @ApiProperty({
    description: 'Visibility',
    example: 'public',
    enum: ['public', 'private'],
  })
  visibility: string;

  @ApiProperty({
    description: 'Usage count',
    example: 5,
  })
  usageCount: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Creator user details',
  })
  creator?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
