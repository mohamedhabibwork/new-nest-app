import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PipelinesService } from './pipelines.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';
import { PipelineResponseDto } from './dto/pipeline-response.dto';
import { PipelineStageResponseDto } from './dto/pipeline-stage-response.dto';

@ApiTags('pipelines')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'pipelines', version: '1' })
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @ApiOperation({ summary: 'Create a new pipeline' })
  @ApiResponse({
    status: 201,
    description: 'Pipeline created successfully',
    type: PipelineResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreatePipelineDto) {
    return this.pipelinesService.create(createDto);
  }

  @ApiOperation({ summary: 'Get all pipelines' })
  @ApiResponse({
    status: 200,
    description: 'List of pipelines',
    type: [PipelineResponseDto],
  })
  @Get()
  findAll() {
    return this.pipelinesService.findAll();
  }

  @ApiOperation({ summary: 'Get a pipeline by ID' })
  @ApiParam({ name: 'id', description: 'Pipeline ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline details',
    type: PipelineResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pipeline not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pipelinesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a pipeline' })
  @ApiParam({ name: 'id', description: 'Pipeline ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline updated successfully',
    type: PipelineResponseDto,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePipelineDto) {
    return this.pipelinesService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a pipeline' })
  @ApiParam({ name: 'id', description: 'Pipeline ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Cannot delete pipeline with deals' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.pipelinesService.remove(id);
  }

  // Pipeline Stage endpoints
  @ApiOperation({ summary: 'Create a new pipeline stage' })
  @ApiResponse({
    status: 201,
    description: 'Pipeline stage created successfully',
    type: PipelineStageResponseDto,
  })
  @Post('stages')
  @HttpCode(HttpStatus.CREATED)
  createStage(@Body() createDto: CreatePipelineStageDto) {
    return this.pipelinesService.createStage(createDto);
  }

  @ApiOperation({ summary: 'Get all stages for a pipeline' })
  @ApiParam({ name: 'id', description: 'Pipeline ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'List of pipeline stages',
    type: [PipelineStageResponseDto],
  })
  @Get(':id/stages')
  findAllStages(@Param('id') pipelineId: string) {
    return this.pipelinesService.findAllStages(pipelineId);
  }

  @ApiOperation({ summary: 'Get a pipeline stage by ID' })
  @ApiParam({ name: 'id', description: 'Stage ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline stage details',
    type: PipelineStageResponseDto,
  })
  @Get('stages/:id')
  findOneStage(@Param('id') id: string) {
    return this.pipelinesService.findOneStage(id);
  }

  @ApiOperation({ summary: 'Update a pipeline stage' })
  @ApiParam({ name: 'id', description: 'Stage ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline stage updated successfully',
    type: PipelineStageResponseDto,
  })
  @Patch('stages/:id')
  updateStage(@Param('id') id: string, @Body() updateDto: UpdatePipelineStageDto) {
    return this.pipelinesService.updateStage(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a pipeline stage' })
  @ApiParam({ name: 'id', description: 'Stage ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline stage deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Cannot delete stage with deals' })
  @Delete('stages/:id')
  @HttpCode(HttpStatus.OK)
  removeStage(@Param('id') id: string) {
    return this.pipelinesService.removeStage(id);
  }
}

