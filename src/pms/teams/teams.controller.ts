import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { TeamMemberResponseDto } from './dto/team-member-response.dto';
import { TeamResponseDto } from './dto/team-response.dto';

@ApiTags('teams')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'teams', version: '1' })
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add user to team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: 201,
    description: 'User added to team successfully',
    type: TeamMemberResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  async addMember(
    @Param('id') teamId: string,
    @Body() addMemberDto: AddTeamMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.teamsService.addUserToTeam(
      teamId,
      addMemberDto.userId,
      req.user.id,
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove user from team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'User removed from team successfully',
  })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  async removeMember(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.teamsService.removeUserFromTeam(teamId, userId, req.user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List team members' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: 200,
    description: 'List of team members',
    type: [TeamMemberResponseDto],
  })
  async getMembers(@Param('id') teamId: string) {
    return this.teamsService.getTeamMembers(teamId);
  }

  @Get()
  @ApiOperation({ summary: 'List teams' })
  @ApiQuery({
    name: 'workspaceId',
    required: false,
    description: 'Filter by workspace ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter teams user belongs to',
  })
  @ApiResponse({
    status: 200,
    description: 'List of teams',
    type: [TeamResponseDto],
  })
  async getTeams(
    @Query('workspaceId') workspaceId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.teamsService.getTeams(workspaceId, userId);
  }
}
