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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';

@ApiTags('activities')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'activities', version: '1' })
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({
    status: 201,
    description: 'Activity created successfully',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateActivityDto,
  ) {
    return this.activitiesService.create(req.user.id, createDto);
  }

  @ApiOperation({
    summary: 'Get all activities with pagination, filtering, and sorting',
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
    name: 'contactId',
    required: false,
    type: String,
    description: 'Filter by contact ID',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Filter by company ID',
  })
  @ApiQuery({
    name: 'dealId',
    required: false,
    type: String,
    description: 'Filter by deal ID',
  })
  @ApiQuery({
    name: 'activityType',
    required: false,
    enum: ['email', 'call', 'meeting', 'note', 'task'],
    description: 'Filter by activity type',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'direction',
    required: false,
    enum: ['inbound', 'outbound'],
    description: 'Filter by direction',
  })
  @ApiQuery({
    name: 'activityDateFrom',
    required: false,
    type: String,
    description: 'Filter activities from this date',
  })
  @ApiQuery({
    name: 'activityDateTo',
    required: false,
    type: String,
    description: 'Filter activities until this date',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in subject and description',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'activityDate'],
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
    description: 'List of activities with pagination',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(@Query() queryDto: ActivityQueryDto) {
    return this.activitiesService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get an activity by ID' })
  @ApiParam({
    name: 'id',
    description: 'Activity ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity details',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an activity' })
  @ApiParam({
    name: 'id',
    description: 'Activity ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity updated successfully',
    type: ActivityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete an activity' })
  @ApiParam({
    name: 'id',
    description: 'Activity ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.activitiesService.remove(id, req.user.id);
  }
}
