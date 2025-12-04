import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: 'Contact email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Mobile number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiPropertyOptional({
    description: 'Company ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Lifecycle stage',
    enum: [
      'lead',
      'mql',
      'sql',
      'opportunity',
      'customer',
      'evangelist',
      'other',
    ],
    example: 'lead',
  })
  @IsEnum([
    'lead',
    'mql',
    'sql',
    'opportunity',
    'customer',
    'evangelist',
    'other',
  ])
  @IsOptional()
  lifecycleStage?: string;

  @ApiPropertyOptional({
    description: 'Lead status',
    enum: ['new', 'contacted', 'qualified', 'unqualified', 'lost'],
    example: 'new',
  })
  @IsEnum(['new', 'contacted', 'qualified', 'unqualified', 'lost'])
  @IsOptional()
  leadStatus?: string;

  @ApiPropertyOptional({
    description: 'Lead source',
    example: 'website',
  })
  @IsString()
  @IsOptional()
  leadSource?: string;

  @ApiPropertyOptional({
    description: 'Owner user ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Lead score (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  leadScore?: number;

  @ApiPropertyOptional({
    description: 'Last contacted date',
    example: '2024-12-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  lastContacted?: Date;

  @ApiPropertyOptional({
    description: 'Custom properties as JSON object',
    example: { customField1: 'value1', customField2: 'value2' },
  })
  @IsObject()
  @IsOptional()
  customProperties?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Tags (comma-separated)',
    example: 'vip,enterprise,hot-lead',
  })
  @IsString()
  @IsOptional()
  tags?: string;
}
