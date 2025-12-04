import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShareResponseDto {
  @ApiProperty({
    description: 'Share ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @ApiProperty({
    description: 'Type of shareable entity',
    example: 'task',
  })
  shareableType: string;

  @ApiProperty({
    description: 'ID of the shareable entity',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  shareableId: string;

  @ApiProperty({
    description: 'Type of entity shared with',
    example: 'users',
  })
  sharedWithType: string;

  @ApiProperty({
    description: 'ID of the user or team shared with',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  sharedWithId: string;

  @ApiProperty({
    description: 'Permission level',
    example: 'view',
    enum: ['view', 'edit', 'admin'],
  })
  permission: string;

  @ApiProperty({
    description: 'ID of the user who created the share',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  sharedById: string;

  @ApiPropertyOptional({
    description: 'Expiration date',
    example: '2024-12-31T23:59:59.000Z',
  })
  expiresAt?: Date;

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
    description: 'User who created the share',
  })
  sharedBy?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
