import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FileResponseDto {
  @Expose()
  @ApiProperty({ description: 'File ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Entity type', example: 'task' })
  entityType: string;

  @Expose()
  @ApiProperty({ description: 'Entity ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  entityId: string;

  @Expose()
  @ApiProperty({ description: 'Original file name', example: 'document.pdf' })
  fileName: string;

  @Expose()
  @ApiProperty({ description: 'File path in storage' })
  filePath: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Public file URL' })
  fileUrl?: string;

  @Expose()
  @ApiProperty({ description: 'File MIME type', example: 'application/pdf' })
  fileType: string;

  @Expose()
  @ApiProperty({ description: 'File size in bytes', example: 1024000 })
  fileSize: number;

  @Expose()
  @ApiProperty({ description: 'Storage type', example: 'local' })
  storageType: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: Record<string, unknown>;

  @Expose()
  @ApiProperty({ description: 'User ID who uploaded the file' })
  uploadedBy: string;

  @Expose()
  @ApiProperty({ description: 'Upload timestamp' })
  uploadedAt: Date;
}

