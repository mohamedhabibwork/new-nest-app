import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ActivityResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Activity ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Activity type',
    enum: ['email', 'call', 'meeting', 'note', 'task'],
  })
  activityType: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Contact ID' })
  contactId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Deal ID' })
  dealId?: string;

  @Expose()
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Activity subject' })
  subject?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Activity description' })
  description?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Direction',
    enum: ['inbound', 'outbound'],
  })
  direction?: string;

  @Expose()
  @ApiProperty({ description: 'Activity date and time' })
  activityDate: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Duration in minutes' })
  durationMinutes?: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: Record<string, unknown>;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}
