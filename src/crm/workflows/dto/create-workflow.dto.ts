import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WorkflowActionDto {
  @ApiProperty({
    description: 'Action type',
    enum: [
      'create_task',
      'send_email',
      'update_field',
      'create_deal',
      'assign_owner',
      'webhook',
      'delay',
    ],
    example: 'send_email',
  })
  @IsEnum([
    'create_task',
    'send_email',
    'update_field',
    'create_deal',
    'assign_owner',
    'webhook',
    'delay',
  ])
  @IsNotEmpty()
  actionType: string;

  @ApiProperty({
    description: 'Execution order',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  executionOrder: number;

  @ApiProperty({
    description: 'Action configuration as JSON object',
    example: { emailTemplate: 'welcome', to: 'contact.email' },
  })
  @IsObject()
  @IsNotEmpty()
  actionConfig: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Delay in minutes',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  delayMinutes?: number;
}

export class CreateWorkflowDto {
  @ApiProperty({
    description: 'Workflow name',
    example: 'New Lead Welcome',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Trigger type',
    enum: [
      'form_submission',
      'field_change',
      'stage_change',
      'date_based',
      'manual',
    ],
    example: 'form_submission',
  })
  @IsEnum([
    'form_submission',
    'field_change',
    'stage_change',
    'date_based',
    'manual',
  ])
  @IsNotEmpty()
  triggerType: string;

  @ApiPropertyOptional({
    description: 'Trigger conditions as JSON object',
  })
  @IsObject()
  @IsOptional()
  triggerConditions?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Form ID (for form_submission trigger)',
  })
  @IsString()
  @IsOptional()
  formId?: string;

  @ApiPropertyOptional({
    description: 'Is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Workflow actions',
    type: [WorkflowActionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionDto)
  actions: WorkflowActionDto[];
}
