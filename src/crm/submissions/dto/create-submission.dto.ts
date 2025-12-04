import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmissionValueDto {
  @ApiProperty({
    description: 'Form column ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  formColumnId: string;

  @ApiProperty({
    description: 'Value type',
    enum: ['text', 'number', 'boolean', 'date', 'json', 'array', 'file', 'files'],
  })
  @IsString()
  @IsNotEmpty()
  valueType: string;

  @ApiPropertyOptional({ description: 'Text value' })
  @IsString()
  @IsOptional()
  valueText?: string;

  @ApiPropertyOptional({ description: 'Number value' })
  @IsOptional()
  valueNumber?: number;

  @ApiPropertyOptional({ description: 'Boolean value' })
  @IsOptional()
  valueBoolean?: boolean;

  @ApiPropertyOptional({ description: 'Date value' })
  @IsOptional()
  valueDate?: Date;

  @ApiPropertyOptional({ description: 'JSON value' })
  @IsObject()
  @IsOptional()
  valueJson?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Array value' })
  @IsArray()
  @IsOptional()
  valueArray?: unknown[];

  @ApiPropertyOptional({ description: 'File metadata' })
  @IsObject()
  @IsOptional()
  fileMetadata?: Record<string, unknown>;
}

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'Form ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  formId: string;

  @ApiProperty({
    description: 'Submitter email',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  submitterEmail: string;

  @ApiProperty({
    description: 'Submission values',
    type: [SubmissionValueDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionValueDto)
  values: SubmissionValueDto[];

  @ApiPropertyOptional({ description: 'IP address' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'UTM parameters' })
  @IsObject()
  @IsOptional()
  utmParameters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Referrer URL' })
  @IsString()
  @IsOptional()
  referrerUrl?: string;

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

