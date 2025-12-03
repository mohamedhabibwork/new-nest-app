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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CollaborationService } from './collaboration.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { TimeLogResponseDto } from './dto/time-log-response.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { TimeLogQueryDto } from './dto/time-log-query.dto';

@ApiTags('collaboration')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'collaboration', version: '1' })
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @ApiOperation({ summary: 'Create a comment on a task' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Post('comments')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateCommentDto,
  ) {
    return this.collaborationService.createComment(req.user.id, createDto);
  }

  @ApiOperation({ summary: 'Get all comments for a task with pagination and sorting' })
  @ApiParam({ name: 'taskId', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 50 })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt'], description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'List of comments with pagination',
    type: CommentResponseDto,
  })
  @Get('tasks/:taskId/comments')
  getTaskComments(
    @Param('taskId') taskId: string,
    @Query() queryDto: CommentQueryDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.collaborationService.getTaskComments(queryDto, taskId, req.user.id);
  }

  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the comment owner' })
  @Patch('comments/:id')
  updateComment(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: { commentText: string },
  ) {
    return this.collaborationService.updateComment(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the comment owner' })
  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  deleteComment(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.collaborationService.deleteComment(id, req.user.id);
  }

  @ApiOperation({ summary: 'Create a time log entry for a task' })
  @ApiResponse({
    status: 201,
    description: 'Time log created successfully',
    type: TimeLogResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Post('time-logs')
  @HttpCode(HttpStatus.CREATED)
  createTimeLog(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateTimeLogDto,
  ) {
    return this.collaborationService.createTimeLog(req.user.id, createDto);
  }

  @ApiOperation({ summary: 'Get all time logs for a task with pagination, filtering, and sorting' })
  @ApiParam({ name: 'taskId', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 50 })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'logDateFrom', required: false, type: String, description: 'Filter time logs from this date' })
  @ApiQuery({ name: 'logDateTo', required: false, type: String, description: 'Filter time logs until this date' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'logDate', 'hoursLogged'], description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'List of time logs with pagination',
    type: TimeLogResponseDto,
  })
  @Get('tasks/:taskId/time-logs')
  getTaskTimeLogs(
    @Param('taskId') taskId: string,
    @Query() queryDto: TimeLogQueryDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.collaborationService.getTaskTimeLogs(queryDto, taskId, req.user.id);
  }

  @ApiOperation({ summary: 'Get all attachments for a task (using unified file system)' })
  @ApiParam({ name: 'taskId', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'List of task attachments',
  })
  @Get('tasks/:taskId/attachments')
  getTaskAttachments(@Param('taskId') taskId: string, @Request() req: { user: { id: string } }) {
    return this.collaborationService.getTaskAttachments(taskId, req.user.id);
  }
}
