import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, Max, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePipelineStageDto {
  @ApiProperty({
    description: 'Pipeline ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  pipelineId: string;

  @ApiProperty({
    description: 'Stage name',
    example: 'Qualification',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Display order',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  displayOrder: number;

  @ApiPropertyOptional({
    description: 'Default probability (0-100)',
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  defaultProbability?: number;

  @ApiPropertyOptional({
    description: 'Is closed won stage',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isClosedWon?: boolean;

  @ApiPropertyOptional({
    description: 'Is closed lost stage',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isClosedLost?: boolean;

  @ApiPropertyOptional({
    description: 'Automation triggers as JSON object',
  })
  @IsObject()
  @IsOptional()
  automationTriggers?: Record<string, unknown>;
}

