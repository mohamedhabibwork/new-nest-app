import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WorkspaceResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Workspace ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Workspace name', example: 'Acme Corporation' })
  workspaceName: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Workspace description',
    example: 'Main workspace for projects',
  })
  description?: string;

  @Expose()
  @ApiProperty({
    description: 'Owner user ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  ownerId: string;

  @Expose()
  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
