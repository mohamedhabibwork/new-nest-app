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
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealResponseDto } from './dto/deal-response.dto';
import { DealQueryDto } from './dto/deal-query.dto';

@ApiTags('deals')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'deals', version: '1' })
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @ApiOperation({ summary: 'Create a new deal' })
  @ApiResponse({
    status: 201,
    description: 'Deal created successfully',
    type: DealResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateDealDto,
  ) {
    return this.dealsService.create(req.user.id, createDto);
  }

  @ApiOperation({
    summary: 'Get all deals with pagination, filtering, and sorting',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'contactId', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'pipelineId', required: false, type: String })
  @ApiQuery({ name: 'stageId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['open', 'won', 'lost', 'abandoned'],
  })
  @ApiQuery({ name: 'ownerId', required: false, type: String })
  @ApiQuery({ name: 'closeDateFrom', required: false, type: String })
  @ApiQuery({ name: 'closeDateTo', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'closeDate', 'amount', 'probability'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'List of deals with pagination',
    type: DealResponseDto,
  })
  @Get()
  findAll(@Query() queryDto: DealQueryDto) {
    return this.dealsService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a deal by ID' })
  @ApiParam({ name: 'id', description: 'Deal ID' })
  @ApiResponse({
    status: 200,
    description: 'Deal details',
    type: DealResponseDto,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a deal' })
  @ApiParam({ name: 'id', description: 'Deal ID' })
  @ApiResponse({
    status: 200,
    description: 'Deal updated successfully',
    type: DealResponseDto,
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateDealDto,
  ) {
    return this.dealsService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a deal' })
  @ApiParam({ name: 'id', description: 'Deal ID' })
  @ApiResponse({
    status: 200,
    description: 'Deal deleted successfully',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.dealsService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: 'Move deal to a different stage' })
  @ApiParam({ name: 'id', description: 'Deal ID' })
  @ApiParam({ name: 'stageId', description: 'Stage ID' })
  @ApiResponse({
    status: 200,
    description: 'Deal moved to stage successfully',
  })
  @Patch(':id/stages/:stageId')
  moveToStage(
    @Param('id') dealId: string,
    @Param('stageId') stageId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.dealsService.moveToStage(dealId, stageId, req.user.id);
  }
}
