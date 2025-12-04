import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  Version,
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
import { WorkspacesService } from './workspaces.service';
import { WorkspaceInvitationService } from './services/workspace-invitation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { WorkspaceQueryDto } from './dto/workspace-query.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { WorkspaceInvitationResponseDto } from './dto/workspace-invitation-response.dto';

@ApiTags('workspaces')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'workspaces', version: '1' })
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly invitationService: WorkspaceInvitationService,
  ) {}

  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({
    status: 201,
    description: 'Workspace created successfully',
    type: WorkspaceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(req.user.id, createDto);
  }

  @ApiOperation({
    summary:
      'Get all workspaces for the current user with pagination, filtering, and sorting',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 50,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in workspace name',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'workspaceName'],
    description: 'Sort by field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'List of workspaces with pagination',
    type: WorkspaceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(
    @Query() queryDto: WorkspaceQueryDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.workspacesService.findAll(queryDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get a workspace by ID' })
  @ApiParam({
    name: 'id',
    description: 'Workspace ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace details',
    type: WorkspaceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to workspace',
  })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.workspacesService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update a workspace' })
  @ApiParam({
    name: 'id',
    description: 'Workspace ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace updated successfully',
    type: WorkspaceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to workspace',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a workspace' })
  @ApiParam({
    name: 'id',
    description: 'Workspace ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to workspace',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.workspacesService.remove(id, req.user.id);
  }

  @Post(':id/invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite user to workspace' })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({
    status: 201,
    description: 'Invitation sent successfully',
    type: WorkspaceInvitationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async inviteUser(
    @Param('id') workspaceId: string,
    @Body() inviteUserDto: InviteUserDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.invitationService.inviteUserToWorkspace(
      workspaceId,
      inviteUserDto.email,
      inviteUserDto.role,
      req.user.id,
    );
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: 'List workspace invitations' })
  @ApiParam({ name: 'id', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'List of invitations',
    type: [WorkspaceInvitationResponseDto],
  })
  async getInvitations(@Param('id') workspaceId: string) {
    return this.invitationService.getWorkspaceInvitations(workspaceId);
  }

  @Post('invitations/:token/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept workspace invitation' })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async acceptInvitation(
    @Param('token') token: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.invitationService.acceptInvitation(token, req.user.id);
  }

  @Delete('invitations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel workspace invitation' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({
    status: 204,
    description: 'Invitation cancelled successfully',
  })
  async cancelInvitation(@Param('id') id: string) {
    return this.invitationService.cancelInvitation(id);
  }

  @Post('invitations/:id/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend workspace invitation email' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({
    status: 200,
    description: 'Invitation email resent successfully',
  })
  async resendInvitation(@Param('id') id: string) {
    return this.invitationService.resendInvitation(id);
  }
}
