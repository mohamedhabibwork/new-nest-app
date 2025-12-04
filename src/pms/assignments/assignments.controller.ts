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
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';

@ApiTags('assignments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'assignments', version: '1' })
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiResponse({
    status: 201,
    description: 'Assignment created successfully',
    type: AssignmentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Entity or assignee not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to entity' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.create(req.user.id, createDto);
  }

  @ApiOperation({
    summary: 'Get all assignments with pagination and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'List of assignments with pagination',
    type: [AssignmentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(
    @Query() queryDto: AssignmentQueryDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.assignmentsService.findAll(queryDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get an assignment by ID' })
  @ApiParam({
    name: 'id',
    description: 'Assignment ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment details',
    type: AssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to assignment',
  })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.assignmentsService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update an assignment' })
  @ApiParam({
    name: 'id',
    description: 'Assignment ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment updated successfully',
    type: AssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No permission to update',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Update assignment status' })
  @ApiParam({
    name: 'id',
    description: 'Assignment ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiQuery({
    name: 'status',
    description: 'New status',
    enum: [
      'pending',
      'accepted',
      'in_progress',
      'completed',
      'blocked',
      'declined',
    ],
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment status updated successfully',
    type: AssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only assignee can update status',
  })
  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.assignmentsService.updateStatus(id, req.user.id, status);
  }

  @ApiOperation({ summary: 'Remove an assignment' })
  @ApiParam({
    name: 'id',
    description: 'Assignment ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only assigner can remove',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.assignmentsService.remove(id, req.user.id);
  }
}
