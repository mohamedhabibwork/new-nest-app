import { ApiProperty } from '@nestjs/swagger';

export class PasskeyResponseDto {
  @ApiProperty({
    description: 'Passkey ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @ApiProperty({
    description: 'Device name',
    example: 'iPhone 15 Pro',
  })
  deviceName: string | null;

  @ApiProperty({
    description: 'Last used timestamp',
    example: '2024-12-04T10:00:00.000Z',
    nullable: true,
  })
  lastUsedAt: Date | null;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-12-04T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated timestamp',
    example: '2024-12-04T10:00:00.000Z',
  })
  updatedAt: Date;
}
