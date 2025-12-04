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
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { CreateTaggingDto } from './dto/create-tagging.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { TaggingResponseDto } from './dto/tagging-response.dto';

@ApiTags('tags')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tags', version: '1' })
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // ============================================
  // Tag Management Endpoints
  // ============================================

  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    type: TagResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Tag name already exists' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateTagDto,
  ) {
    return this.tagsService.create(req.user.id, createDto);
  }

  @ApiOperation({ summary: 'Get all tags with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of tags with pagination',
    type: [TagResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(
    @Query() queryDto: TagQueryDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.tagsService.findAll(queryDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiParam({
    name: 'id',
    description: 'Tag ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag details',
    type: TagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to private tag',
  })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tagsService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({
    name: 'id',
    description: 'Tag ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully',
    type: TagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only creator can update',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({
    name: 'id',
    description: 'Tag ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only creator can delete',
  })
  @ApiResponse({
    status: 400,
    description: 'Tag is in use and cannot be deleted',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tagsService.remove(id, req.user.id);
  }

  // ============================================
  // Tagging Management Endpoints
  // ============================================

  @ApiOperation({ summary: 'Add a tag to content (create tagging)' })
  @ApiResponse({
    status: 201,
    description: 'Tagging created successfully',
    type: TaggingResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Tag or entity not found' })
  @ApiResponse({ status: 400, description: 'Tagging already exists' })
  @Post('taggings')
  @HttpCode(HttpStatus.CREATED)
  addTagging(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateTaggingDto,
  ) {
    return this.tagsService.addTagging(req.user.id, createDto);
  }

  @ApiOperation({ summary: 'Get all taggings for a content entity' })
  @ApiQuery({
    name: 'taggableType',
    description: 'Type of entity',
    enum: ['task', 'project', 'ticket'],
  })
  @ApiQuery({ name: 'taggableId', description: 'ID of entity' })
  @ApiResponse({
    status: 200,
    description: 'List of taggings',
    type: [TaggingResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  @Get('taggings')
  getTaggings(
    @Query('taggableType') taggableType: string,
    @Query('taggableId') taggableId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.tagsService.getTaggings(taggableType, taggableId, req.user.id);
  }

  @ApiOperation({ summary: 'Remove a tag from content (delete tagging)' })
  @ApiParam({ name: 'tagId', description: 'Tag ID' })
  @ApiQuery({
    name: 'taggableType',
    description: 'Type of entity',
    enum: ['task', 'project', 'ticket'],
  })
  @ApiQuery({ name: 'taggableId', description: 'ID of entity' })
  @ApiResponse({
    status: 200,
    description: 'Tagging removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Tagging not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to entity' })
  @Delete('taggings/:tagId')
  @HttpCode(HttpStatus.OK)
  removeTagging(
    @Param('tagId') tagId: string,
    @Query('taggableType') taggableType: string,
    @Query('taggableId') taggableId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.tagsService.removeTagging(
      tagId,
      taggableType,
      taggableId,
      req.user.id,
    );
  }
}
