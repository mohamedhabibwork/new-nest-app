import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SegmentCriteriaDto {
  @ApiProperty({
    description: 'Property name to filter on',
    example: 'lifecycleStage',
  })
  @IsString()
  @IsNotEmpty()
  propertyName: string;

  @ApiProperty({
    description: 'Operator',
    enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'],
    example: 'equals',
  })
  @IsEnum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'])
  @IsNotEmpty()
  operator: string;

  @ApiPropertyOptional({
    description: 'Value to compare against',
  })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({
    description: 'Logic operator (and/or)',
    enum: ['and', 'or'],
    example: 'and',
  })
  @IsEnum(['and', 'or'])
  @IsOptional()
  logic?: string;
}

export class CreateSegmentDto {
  @ApiProperty({
    description: 'Segment name',
    example: 'High Value Customers',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Segment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Segment type',
    enum: ['static', 'dynamic'],
    example: 'dynamic',
  })
  @IsEnum(['static', 'dynamic'])
  @IsNotEmpty()
  segmentType: string;

  @ApiPropertyOptional({
    description: 'Segment criteria',
    type: [SegmentCriteriaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentCriteriaDto)
  @IsOptional()
  criteria?: SegmentCriteriaDto[];
}

