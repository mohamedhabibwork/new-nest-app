import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({
    description: 'Activity type',
    enum: ['email', 'call', 'meeting', 'note', 'task'],
    example: 'call',
  })
  @IsEnum(['email', 'call', 'meeting', 'note', 'task'])
  @IsNotEmpty()
  activityType: string;

  @ApiPropertyOptional({
    description: 'Contact ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  contactId?: string;

  @ApiPropertyOptional({
    description: 'Company ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Deal ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  dealId?: string;

  @ApiPropertyOptional({
    description: 'Activity subject',
    example: 'Follow-up call',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  subject?: string;

  @ApiPropertyOptional({
    description: 'Activity description',
    example: 'Discussed product features and pricing',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Direction',
    enum: ['inbound', 'outbound'],
    example: 'outbound',
  })
  @IsEnum(['inbound', 'outbound'])
  @IsOptional()
  direction?: string;

  @ApiProperty({
    description: 'Activity date and time',
    example: '2024-12-01T10:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  activityDate: Date;

  @ApiPropertyOptional({
    description: 'Duration in minutes',
    example: 30,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON object',
    example: { location: 'Zoom', attendees: ['john@example.com'] },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
