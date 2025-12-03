import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WorkspaceRole {
  PROJECT_MANAGER = 'project_manager',
  TEAM_MEMBER = 'team_member',
  VIEWER = 'viewer',
}

export class InviteUserDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role to assign in the workspace',
    enum: WorkspaceRole,
    example: WorkspaceRole.TEAM_MEMBER,
  })
  @IsEnum(WorkspaceRole)
  @IsNotEmpty()
  role: WorkspaceRole;
}

