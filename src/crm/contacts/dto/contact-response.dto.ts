import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ContactResponseDto {
  @Expose()
  @ApiProperty({ description: 'Contact ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  email: string;

  @Expose()
  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  firstName?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  lastName?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Mobile number' })
  mobile?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Lifecycle stage',
    enum: ['lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist', 'other'],
  })
  lifecycleStage?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Lead status',
    enum: ['new', 'contacted', 'qualified', 'unqualified', 'lost'],
  })
  leadStatus?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Lead source' })
  leadSource?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Owner user ID' })
  ownerId?: string;

  @Expose()
  @ApiProperty({ description: 'Lead score', example: 50 })
  leadScore: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Last contacted date' })
  lastContacted?: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Custom properties' })
  customProperties?: Record<string, unknown>;

  @Expose()
  @ApiPropertyOptional({ description: 'Tags' })
  tags?: string;

  @Expose()
  @ApiProperty({ description: 'Is deleted', example: false })
  isDeleted: boolean;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

