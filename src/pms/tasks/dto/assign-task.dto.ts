import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignTaskDto {
  @ApiProperty({
    description: 'User ID to assign to the task',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Whether this is the primary assignee',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

