import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTeamMemberDto {
  @ApiProperty({
    description: 'User ID to add to the team',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
