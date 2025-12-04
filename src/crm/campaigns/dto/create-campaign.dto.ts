import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmailCampaignDto {
  @ApiProperty({
    description: 'Campaign name',
    example: 'Q4 Product Launch',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Email subject',
    example: 'Introducing Our New Product',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject: string;

  @ApiProperty({
    description: 'Email content (HTML)',
    example: '<html><body><h1>Welcome!</h1></body></html>',
  })
  @IsString()
  @IsNotEmpty()
  emailContent: string;

  @ApiProperty({
    description: 'Segment ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  segmentId: string;

  @ApiPropertyOptional({
    description: 'Campaign status',
    enum: ['draft', 'scheduled', 'sending', 'sent', 'cancelled'],
    example: 'draft',
  })
  @IsEnum(['draft', 'scheduled', 'sending', 'sent', 'cancelled'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Scheduled send time',
    example: '2024-12-15T10:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  scheduledSendTime?: Date;
}

