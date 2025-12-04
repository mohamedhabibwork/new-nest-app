import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TimeLogResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Time log ID',
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
  @ApiProperty({ description: 'User ID who logged the time' })
  userId: string;

  @Expose()
  @ApiProperty({ description: 'Hours logged', example: 2.5 })
  hoursLogged: number;

  @Expose()
  @ApiProperty({ description: 'Date of the time log' })
  logDate: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Description of work done' })
  description?: string;

  @Expose()
  @ApiProperty({ description: 'Whether the time is billable', example: false })
  isBillable: boolean;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}
