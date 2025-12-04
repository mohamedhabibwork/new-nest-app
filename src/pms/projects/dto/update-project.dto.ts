import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Name of the project',
    example: 'Website Redesign Updated',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  projectName?: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example: 'Updated project description',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Project status',
    example: 'in_progress',
    enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Project start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Project end date',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Project priority',
    example: 'high',
    enum: ['low', 'medium', 'high', 'urgent'],
  })
  @IsString()
  @IsOptional()
  priority?: string;
}
