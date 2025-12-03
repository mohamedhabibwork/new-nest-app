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
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { TaskAssignmentResponseDto } from './dto/task-assignment-response.dto';
import { CreateTaskDependencyDto } from './dto/create-task-dependency.dto';
import { TaskDependencyResponseDto } from './dto/task-dependency-response.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { ChecklistItemResponseDto } from './dto/checklist-item-response.dto';
import { ReorderChecklistDto } from './dto/reorder-checklist.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateTaskDto,
  ) {
    return this.tasksService.create(req.user.id, createDto);
  }

  @ApiOperation({ summary: 'Get all tasks with pagination, filtering, and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 50 })
  @ApiQuery({ name: 'projectId', required: false, type: String, description: 'Filter by project ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['to_do', 'in_progress', 'in_review', 'completed', 'blocked'], description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high', 'critical'], description: 'Filter by priority' })
  @ApiQuery({ name: 'assigneeId', required: false, type: String, description: 'Filter by assignee user ID' })
  @ApiQuery({ name: 'dueDateFrom', required: false, type: String, description: 'Filter tasks due from this date' })
  @ApiQuery({ name: 'dueDateTo', required: false, type: String, description: 'Filter tasks due until this date' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in task title and description' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'taskTitle'], description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'List of tasks with pagination',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(
    @Query() queryDto: TaskQueryDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.tasksService.findAll(queryDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Task details',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to task' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to task' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to task' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tasksService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: 'Get all attachments for a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of task attachments with pagination',
  })
  @Get(':id/attachments')
  getTaskAttachments(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
  ) {
    return this.tasksService.getTaskAttachments(id, req.user.id, page, limit);
  }

  @ApiOperation({ summary: 'Assign a user to a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 201,
    description: 'User assigned to task successfully',
    type: TaskAssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task or user not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - User already assigned' })
  @Post(':id/assign')
  @HttpCode(HttpStatus.CREATED)
  assignUserToTask(
    @Param('id') taskId: string,
    @Request() req: { user: { id: string } },
    @Body() assignDto: AssignTaskDto,
  ) {
    return this.tasksService.assignUserToTask(
      taskId,
      assignDto.userId,
      req.user.id,
      assignDto.isPrimary || false,
    );
  }

  @ApiOperation({ summary: 'Unassign a user from a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiParam({ name: 'userId', description: 'User ID to unassign', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'User unassigned from task successfully',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @Delete(':id/assign/:userId')
  @HttpCode(HttpStatus.OK)
  unassignUserFromTask(
    @Param('id') taskId: string,
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.tasksService.unassignUserFromTask(taskId, userId, req.user.id);
  }

  @ApiOperation({ summary: 'Get all assignments for a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of task assignments with pagination',
  })
  @Get(':id/assignments')
  getTaskAssignments(
    @Param('id') taskId: string,
    @Request() req: { user: { id: string } },
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
  ) {
    return this.tasksService.getTaskAssignments(taskId, req.user.id, page, limit);
  }

  @ApiOperation({ summary: 'Update a task assignment (e.g., set primary)' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Assignment updated successfully',
    type: TaskAssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @Patch(':id/assignments/:assignmentId')
  updateAssignment(
    @Param('id') taskId: string,
    @Param('assignmentId') assignmentId: string,
    @Request() req: { user: { id: string } },
    @Body() body: { isPrimary: boolean },
  ) {
    return this.tasksService.updateAssignment(
      taskId,
      assignmentId,
      req.user.id,
      body.isPrimary,
    );
  }

  @ApiOperation({ summary: 'Add a task dependency' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 201,
    description: 'Dependency created successfully',
    type: TaskDependencyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Circular dependency or tasks in different projects' })
  @Post(':id/dependencies')
  @HttpCode(HttpStatus.CREATED)
  addTaskDependency(
    @Param('id') taskId: string,
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateTaskDependencyDto,
  ) {
    return this.tasksService.addTaskDependency(
      taskId,
      createDto.dependsOnTaskId,
      createDto.dependencyType,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Remove a task dependency' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiParam({ name: 'dependencyId', description: 'Dependency ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Dependency removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Dependency not found' })
  @Delete(':id/dependencies/:dependencyId')
  @HttpCode(HttpStatus.OK)
  removeTaskDependency(
    @Param('id') taskId: string,
    @Param('dependencyId') dependencyId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.tasksService.removeTaskDependency(taskId, dependencyId, req.user.id);
  }

  @ApiOperation({ summary: 'Get all dependencies for a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of task dependencies with pagination',
  })
  @Get(':id/dependencies')
  getTaskDependencies(
    @Param('id') taskId: string,
    @Request() req: { user: { id: string } },
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
  ) {
    return this.tasksService.getTaskDependencies(taskId, req.user.id, page, limit);
  }

  @ApiOperation({ summary: 'Add a checklist item to a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 201,
    description: 'Checklist item created successfully',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @Post(':id/checklist')
  @HttpCode(HttpStatus.CREATED)
  addChecklistItem(
    @Param('id') taskId: string,
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateChecklistItemDto,
  ) {
    return this.tasksService.addChecklistItem(
      taskId,
      req.user.id,
      createDto.itemText,
      createDto.orderIndex,
    );
  }

  @ApiOperation({ summary: 'Update a checklist item' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiParam({ name: 'itemId', description: 'Checklist item ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Checklist item updated successfully',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Checklist item not found' })
  @Patch(':id/checklist/:itemId')
  updateChecklistItem(
    @Param('id') taskId: string,
    @Param('itemId') itemId: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateChecklistItemDto,
  ) {
    return this.tasksService.updateChecklistItem(taskId, itemId, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a checklist item' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiParam({ name: 'itemId', description: 'Checklist item ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Checklist item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Checklist item not found' })
  @Delete(':id/checklist/:itemId')
  @HttpCode(HttpStatus.OK)
  deleteChecklistItem(
    @Param('id') taskId: string,
    @Param('itemId') itemId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.tasksService.deleteChecklistItem(taskId, itemId, req.user.id);
  }

  @ApiOperation({ summary: 'Get all checklist items for a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of checklist items with pagination',
  })
  @Get(':id/checklist')
  getChecklistItems(
    @Param('id') taskId: string,
    @Request() req: { user: { id: string } },
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
  ) {
    return this.tasksService.getChecklistItems(taskId, req.user.id, page, limit);
  }

  @ApiOperation({ summary: 'Reorder checklist items' })
  @ApiParam({ name: 'id', description: 'Task ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Checklist items reordered successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Some items do not belong to this task' })
  @Patch(':id/checklist/reorder')
  @HttpCode(HttpStatus.OK)
  reorderChecklistItems(
    @Param('id') taskId: string,
    @Request() req: { user: { id: string } },
    @Body() reorderDto: ReorderChecklistDto,
  ) {
    return this.tasksService.reorderChecklistItems(taskId, req.user.id, reorderDto.itemIds);
  }
}
