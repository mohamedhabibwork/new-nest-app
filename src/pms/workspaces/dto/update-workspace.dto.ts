import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({
    description: 'Name of the workspace',
    example: 'Acme Corporation Updated',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  workspaceName?: string;

  @ApiPropertyOptional({
    description: 'Description of the workspace',
    example: 'Updated description for Acme Corporation',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}

