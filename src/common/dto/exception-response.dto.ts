import { ApiProperty } from '@nestjs/swagger';

export class ExceptionResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Error code', example: 'VALIDATION_ERROR' })
  errorCode?: string;

  @ApiProperty({ description: 'Error message', example: 'Validation failed' })
  message: string | string[];

  @ApiProperty({ description: 'Error details', required: false })
  details?: any;

  @ApiProperty({ description: 'Timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ description: 'Request path', example: '/api/v1/tasks' })
  path: string;
}

