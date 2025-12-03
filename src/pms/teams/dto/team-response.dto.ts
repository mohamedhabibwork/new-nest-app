import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TeamMemberResponseDto } from './team-member-response.dto';

export class TeamResponseDto {
  @Expose()
  @ApiProperty({ description: 'Team ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Workspace ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  workspaceId: string;

  @Expose()
  @ApiProperty({ description: 'Team name', example: 'Development Team' })
  teamName: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Team description' })
  description?: string;

  @Expose()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional({ 
    description: 'Team members', 
    type: [TeamMemberResponseDto], 
    required: false 
  })
  teamMembers?: TeamMemberResponseDto[];
}

