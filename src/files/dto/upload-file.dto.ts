import { IsString, IsNotEmpty, IsOptional, IsObject, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ description: 'Entity type (workspace, project, task, comment, etc.)' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata (can be null or empty object)',
    nullable: true,
    example: '{"description": "This is a test description"}',
  })
  @IsOptional()
  // @ValidateIf((o) => o.metadata !== null && o.metadata !== undefined)
  // @IsObject()
  metadata?: Record<string, unknown> | null;
}