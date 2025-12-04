import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Product name' })
  name: string;

  @Expose()
  @ApiPropertyOptional({ description: 'SKU' })
  sku?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Product description' })
  description?: string;

  @Expose()
  @ApiProperty({ description: 'Product price' })
  price: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Currency' })
  currency?: string;

  @Expose()
  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}
