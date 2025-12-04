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
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { ShareQueryDto } from './dto/share-query.dto';
import { ShareResponseDto } from './dto/share-response.dto';

@ApiTags('shares')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'shares', version: '1' })
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @ApiOperation({ summary: 'Create a new share' })
  @ApiResponse({
    status: 201,
    description: 'Share created successfully',
    type: ShareResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to entity' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateShareDto,
  ) {
    return this.sharesService.create(req.user.id, createDto);
  }

  @ApiOperation({ summary: 'Get all shares with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of shares with pagination',
    type: [ShareResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(
    @Query() queryDto: ShareQueryDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.sharesService.findAll(queryDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get content shared with the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of shared content with pagination',
    type: [ShareResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  getSharedContent(
    @Request() req: { user: { id: string } },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.sharesService.getSharedContent(req.user.id, page, limit);
  }

  @ApiOperation({ summary: 'Get a share by ID' })
  @ApiParam({
    name: 'id',
    description: 'Share ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Share details',
    type: ShareResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Share not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - No access to share' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.sharesService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update a share' })
  @ApiParam({
    name: 'id',
    description: 'Share ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Share updated successfully',
    type: ShareResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Share not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only creator can update',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateShareDto,
  ) {
    return this.sharesService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Remove a share' })
  @ApiParam({
    name: 'id',
    description: 'Share ID',
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  @ApiResponse({
    status: 200,
    description: 'Share removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Share not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only creator can remove',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.sharesService.remove(id, req.user.id);
  }
}
