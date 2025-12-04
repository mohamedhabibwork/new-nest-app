import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChecklistItemDto {
  @ApiProperty({
    description: 'Checklist item text',
    example: 'Review design mockups',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  itemText: string;

  @ApiPropertyOptional({
    description: 'Order index for sorting',
    example: 0,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  orderIndex?: number;
}
