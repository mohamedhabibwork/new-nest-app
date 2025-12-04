import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CompanyResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Company ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Company name', example: 'Acme Corporation' })
  name: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Company domain', example: 'acme.com' })
  domain?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Industry' })
  industry?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'City' })
  city?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'State' })
  state?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Country' })
  country?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Employee count', example: 500 })
  employeeCount?: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Annual revenue', example: 10000000.5 })
  annualRevenue?: number;

  @Expose()
  @ApiPropertyOptional({
    description: 'Company type',
    enum: ['prospect', 'customer', 'partner', 'vendor'],
  })
  companyType?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Parent company ID' })
  parentCompanyId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Owner user ID' })
  ownerId?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Custom properties' })
  customProperties?: Record<string, unknown>;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
