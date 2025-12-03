import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SessionResponseDto {
  @Expose()
  @ApiProperty({ description: 'Session ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'User ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  userId: string;

  @Expose()
  @ApiProperty({ description: 'JWT ID (JTI)', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  jti: string;

  @Expose()
  @ApiPropertyOptional({ description: 'IP address', example: '192.168.1.1' })
  ipAddress?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'User agent', example: 'Mozilla/5.0...' })
  userAgent?: string;

  @Expose()
  @ApiProperty({ description: 'Session expiration timestamp' })
  expiresAt: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Revocation timestamp' })
  revokedAt?: Date;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last used timestamp' })
  lastUsedAt: Date;
}

