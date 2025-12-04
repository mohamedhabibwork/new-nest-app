import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ChecklistItemResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Checklist item ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Task ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  taskId: string;

  @Expose()
  @ApiProperty({
    description: 'Checklist item text',
    example: 'Review design mockups',
  })
  itemText: string;

  @Expose()
  @ApiProperty({ description: 'Whether the item is completed', example: false })
  isCompleted: boolean;

  @Expose()
  @ApiProperty({ description: 'Order index for sorting', example: 0 })
  orderIndex: number;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
