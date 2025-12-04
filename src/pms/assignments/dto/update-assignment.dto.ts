import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({
    description: 'Priority level',
    example: 'high',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: string;

  @ApiPropertyOptional({
    description: 'Due date for the assignment',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Notes or description for the assignment',
    example: 'Updated notes',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
