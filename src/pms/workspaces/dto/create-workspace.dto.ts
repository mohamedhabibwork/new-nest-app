import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({
    description: 'Name of the workspace',
    example: 'Acme Corporation',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  workspaceName: string;

  @ApiPropertyOptional({
    description: 'Description of the workspace',
    example: 'Main workspace for Acme Corporation projects',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
