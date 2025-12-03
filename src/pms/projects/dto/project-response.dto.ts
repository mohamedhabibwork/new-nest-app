import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProjectResponseDto {
  @Expose()
  @ApiProperty({ description: 'Project ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Workspace ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  workspaceId: string;

  @Expose()
  @ApiProperty({ description: 'Project name', example: 'Website Redesign' })
  projectName: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Project description' })
  description?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Project status', example: 'in_progress' })
  status?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Project priority', example: 'high' })
  priority?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Project start date' })
  startDate?: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Project end date' })
  endDate?: Date;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

