import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShareDto {
  @ApiProperty({
    description: 'Type of shareable entity (task, project, ticket, etc.)',
    example: 'task',
    enum: ['task', 'project', 'ticket'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['task', 'project', 'ticket'])
  shareableType: string;

  @ApiProperty({
    description: 'ID of the shareable entity',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  shareableId: string;

  @ApiProperty({
    description: 'Type of entity to share with (users or teams)',
    example: 'users',
    enum: ['users', 'teams'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['users', 'teams'])
  sharedWithType: string;

  @ApiProperty({
    description: 'ID of the user or team to share with',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  sharedWithId: string;

  @ApiPropertyOptional({
    description: 'Permission level',
    example: 'view',
    enum: ['view', 'edit', 'admin'],
    default: 'view',
  })
  @IsString()
  @IsOptional()
  @IsEnum(['view', 'edit', 'admin'])
  permission?: string;

  @ApiPropertyOptional({
    description: 'Expiration date for the share',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}
