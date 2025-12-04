import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFormDto {
  @ApiProperty({
    description: 'Form name',
    example: 'Contact Us Form',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Form description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Form type',
    enum: [
      'lead_capture',
      'contact_update',
      'survey',
      'ticket',
      'registration',
      'other',
    ],
    example: 'lead_capture',
  })
  @IsEnum([
    'lead_capture',
    'contact_update',
    'survey',
    'ticket',
    'registration',
    'other',
  ])
  @IsNotEmpty()
  formType: string;

  @ApiPropertyOptional({
    description: 'Form settings as JSON object',
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Automation rules as JSON object',
  })
  @IsObject()
  @IsOptional()
  automationRules?: Record<string, unknown>;
}
