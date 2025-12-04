import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PipelineStageResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Stage ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Pipeline ID' })
  pipelineId: string;

  @Expose()
  @ApiProperty({ description: 'Stage name', example: 'Qualification' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'Display order', example: 0 })
  displayOrder: number;

  @Expose()
  @ApiProperty({ description: 'Default probability', example: 25 })
  defaultProbability: number;

  @Expose()
  @ApiProperty({ description: 'Is closed won stage', example: false })
  isClosedWon: boolean;

  @Expose()
  @ApiProperty({ description: 'Is closed lost stage', example: false })
  isClosedLost: boolean;

  @Expose()
  @ApiPropertyOptional({ description: 'Automation triggers' })
  automationTriggers?: Record<string, unknown>;
}
