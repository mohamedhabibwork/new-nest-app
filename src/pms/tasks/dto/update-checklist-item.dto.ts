import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChecklistItemDto {
  @ApiPropertyOptional({
    description: 'Checklist item text',
    example: 'Review design mockups',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  itemText?: string;

  @ApiPropertyOptional({
    description: 'Whether the item is completed',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
