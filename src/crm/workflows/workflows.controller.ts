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
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

@ApiTags('workflows')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'workflows', version: '1' })
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(req.user.id, createDto);
  }

  @ApiOperation({ summary: 'Get all workflows' })
  @ApiResponse({ status: 200, description: 'List of workflows' })
  @Get()
  findAll() {
    return this.workflowsService.findAll();
  }

  @ApiOperation({ summary: 'Get a workflow by ID' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Workflow details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: Partial<CreateWorkflowDto>,
  ) {
    return this.workflowsService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }

  @ApiOperation({ summary: 'Execute a workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiResponse({ status: 200, description: 'Workflow executed successfully' })
  @Post(':id/execute')
  @HttpCode(HttpStatus.OK)
  execute(
    @Param('id') workflowId: string,
    @Body()
    context: {
      entityType: string;
      entityId: string;
      userId?: string;
      [key: string]: unknown;
    },
  ) {
    return this.workflowsService.execute(workflowId, context as any);
  }
}
