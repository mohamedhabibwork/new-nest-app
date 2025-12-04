import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WorkspaceInvitationResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Invitation ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Workspace ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  workspaceId: string;

  @Expose()
  @ApiProperty({
    description: 'Invited email address',
    example: 'user@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({ description: 'User ID who sent the invitation' })
  invitedBy: string;

  @Expose()
  @ApiProperty({ description: 'Role assigned', example: 'team_member' })
  role: string;

  @Expose()
  @ApiProperty({ description: 'Invitation status', example: 'pending' })
  status: string;

  @Expose()
  @ApiProperty({ description: 'Expiration date' })
  expiresAt: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'Acceptance date' })
  acceptedAt?: Date;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
