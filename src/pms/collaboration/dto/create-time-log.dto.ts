import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeLogDto {
  @ApiProperty({
    description: 'Task ID to log time for',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({
    description: 'Hours logged',
    example: 2.5,
    minimum: 0.1,
  })
  @IsNumber()
  @Min(0.1)
  hoursLogged: number;

  @ApiProperty({
    description: 'Date of the time log',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsDateString()
  logDate: Date;

  @ApiPropertyOptional({
    description: 'Description of work done',
    example: 'Worked on implementing the user authentication feature',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the time is billable',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean;
}
