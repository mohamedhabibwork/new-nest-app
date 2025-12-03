import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TeamMemberResponseDto {
  @Expose()
  @ApiProperty({ description: 'Team member ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Team ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  teamId: string;

  @Expose()
  @ApiProperty({ description: 'User ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  userId: string;

  @Expose()
  @ApiProperty({ description: 'Member role', example: 'team_member' })
  role: string;

  @Expose()
  @ApiProperty({ description: 'Join timestamp' })
  joinedAt: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'User details' })
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}
