import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corporation',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Company domain',
    example: 'acme.com',
  })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({
    description: 'Industry',
    example: 'Technology',
  })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'San Francisco',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'State',
    example: 'CA',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'USA',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'Employee count',
    example: 500,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  employeeCount?: number;

  @ApiPropertyOptional({
    description: 'Annual revenue',
    example: 10000000.50,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  annualRevenue?: number;

  @ApiPropertyOptional({
    description: 'Company type',
    enum: ['prospect', 'customer', 'partner', 'vendor'],
    example: 'prospect',
  })
  @IsEnum(['prospect', 'customer', 'partner', 'vendor'])
  @IsOptional()
  companyType?: string;

  @ApiPropertyOptional({
    description: 'Parent company ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  parentCompanyId?: string;

  @ApiPropertyOptional({
    description: 'Owner user ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Custom properties as JSON object',
    example: { customField1: 'value1', customField2: 'value2' },
  })
  @IsObject()
  @IsOptional()
  customProperties?: Record<string, unknown>;
}

