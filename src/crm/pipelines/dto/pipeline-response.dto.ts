import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PipelineStageResponseDto } from './pipeline-stage-response.dto';

export class PipelineResponseDto {
  @Expose()
  @ApiProperty({ description: 'Pipeline ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Pipeline name', example: 'Sales Pipeline' })
  name: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Pipeline description' })
  description?: string;

  @Expose()
  @ApiProperty({ description: 'Is default pipeline', example: false })
  isDefault: boolean;

  @Expose()
  @ApiProperty({ description: 'Display order', example: 0 })
  displayOrder: number;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiPropertyOptional({
    description: 'Pipeline stages',
    type: [PipelineStageResponseDto],
  })
  @Type(() => PipelineStageResponseDto)
  stages?: PipelineStageResponseDto[];
}

