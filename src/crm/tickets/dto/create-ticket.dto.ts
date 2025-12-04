import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Ticket subject',
    example: 'Unable to login to account',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @ApiPropertyOptional({
    description: 'Ticket description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Contact ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  contactId: string;

  @ApiPropertyOptional({
    description: 'Assigned to user ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Ticket status',
    enum: ['new', 'open', 'pending', 'resolved', 'closed'],
    example: 'new',
  })
  @IsEnum(['new', 'open', 'pending', 'resolved', 'closed'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Ticket priority',
    enum: ['low', 'normal', 'high', 'urgent'],
    example: 'normal',
  })
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({
    description: 'Ticket category',
    example: 'Technical Support',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Custom properties as JSON object',
  })
  @IsObject()
  @IsOptional()
  customProperties?: Record<string, unknown>;
}

