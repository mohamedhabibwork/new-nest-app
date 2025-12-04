import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TicketResponseDto {
  @Expose()
  @ApiProperty({ description: 'Ticket ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Ticket number', example: 'TKT-000001' })
  ticketNumber: string;

  @Expose()
  @ApiProperty({ description: 'Ticket subject' })
  subject: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Ticket description' })
  description?: string;

  @Expose()
  @ApiProperty({ description: 'Contact ID' })
  contactId: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  assignedTo?: string;

  @Expose()
  @ApiProperty({
    description: 'Ticket status',
    enum: ['new', 'open', 'pending', 'resolved', 'closed'],
  })
  status: string;

  @Expose()
  @ApiProperty({
    description: 'Ticket priority',
    enum: ['low', 'normal', 'high', 'urgent'],
  })
  priority: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Ticket category' })
  category?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Custom properties' })
  customProperties?: Record<string, unknown>;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Resolved timestamp' })
  resolvedAt?: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Closed timestamp' })
  closedAt?: Date;
}
