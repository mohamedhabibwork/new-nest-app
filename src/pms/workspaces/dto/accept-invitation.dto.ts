import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Invitation token received via email',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @IsString()
  @IsNotEmpty()
  invitationToken: string;
}
