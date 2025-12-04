import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsBoolean,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFormColumnDto {
  @ApiProperty({
    description: 'Form ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  formId: string;

  @ApiProperty({
    description: 'Field name (internal identifier)',
    example: 'email',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fieldName: string;

  @ApiProperty({
    description: 'Field label (display name)',
    example: 'Email Address',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fieldLabel: string;

  @ApiProperty({
    description: 'Data type',
    enum: ['text', 'textarea', 'email', 'phone', 'number', 'date', 'datetime', 'boolean', 'single_select', 'multi_select', 'file', 'files', 'json', 'array', 'url'],
    example: 'email',
  })
  @IsEnum(['text', 'textarea', 'email', 'phone', 'number', 'date', 'datetime', 'boolean', 'single_select', 'multi_select', 'file', 'files', 'json', 'array', 'url'])
  @IsNotEmpty()
  dataType: string;

  @ApiPropertyOptional({
    description: 'Mapped property ID (ContactProperty)',
  })
  @IsString()
  @IsOptional()
  mappedPropertyId?: string;

  @ApiPropertyOptional({
    description: 'Validation rules as JSON object',
  })
  @IsObject()
  @IsOptional()
  validationRules?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Field properties (options, placeholder, etc.) as JSON object',
  })
  @IsObject()
  @IsOptional()
  properties?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Is required field',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Conditional logic as JSON object',
  })
  @IsObject()
  @IsOptional()
  conditionalLogic?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Help text',
  })
  @IsString()
  @IsOptional()
  helpText?: string;

  @ApiPropertyOptional({
    description: 'Default value',
  })
  @IsString()
  @IsOptional()
  defaultValue?: string;
}

