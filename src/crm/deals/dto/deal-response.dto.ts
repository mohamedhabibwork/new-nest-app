import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DealResponseDto {
  @Expose()
  @ApiProperty({ description: 'Deal ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Deal name', example: 'Q4 Enterprise Deal' })
  dealName: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Contact ID' })
  contactId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @Expose()
  @ApiProperty({ description: 'Pipeline ID' })
  pipelineId: string;

  @Expose()
  @ApiProperty({ description: 'Stage ID' })
  stageId: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Deal amount', example: 50000.00 })
  amount?: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Currency', example: 'USD' })
  currency?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Expected close date' })
  closeDate?: Date;

  @Expose()
  @ApiProperty({ description: 'Probability percentage', example: 75 })
  probability: number;

  @Expose()
  @ApiProperty({
    description: 'Deal status',
    enum: ['open', 'won', 'lost', 'abandoned'],
  })
  status: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Owner user ID' })
  ownerId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Custom properties' })
  customProperties?: Record<string, unknown>;

  @Expose()
  @ApiPropertyOptional({ description: 'Deal notes' })
  notes?: string;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

