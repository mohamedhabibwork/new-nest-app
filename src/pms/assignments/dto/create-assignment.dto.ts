import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Type of assignable entity (task, project, ticket, etc.)',
    example: 'task',
    enum: ['task', 'project', 'ticket'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['task', 'project', 'ticket'])
  assignableType: string;

  @ApiProperty({
    description: 'ID of the assignable entity',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  assignableId: string;

  @ApiProperty({
    description: 'ID of the user to assign to',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  assigneeId: string;

  @ApiPropertyOptional({
    description: 'Priority level',
    example: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
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
    example: 'Please review and complete by end of week',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
