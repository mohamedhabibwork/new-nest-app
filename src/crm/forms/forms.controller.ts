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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateFormDto } from './dto/create-form.dto';
import { CreateFormColumnDto } from './dto/create-form-column.dto';

@ApiTags('forms')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'forms', version: '1' })
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @ApiOperation({ summary: 'Create a new form' })
  @ApiResponse({ status: 201, description: 'Form created successfully' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateFormDto,
  ) {
    return this.formsService.create(req.user.id, createDto);
  }

  @ApiOperation({ summary: 'Get all forms' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'formType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of forms' })
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('formType') formType?: string,
    @Query('status') status?: string,
  ) {
    return this.formsService.findAll(page, limit, formType, status);
  }

  @ApiOperation({ summary: 'Get a form by ID' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiResponse({ status: 200, description: 'Form details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a form' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiResponse({ status: 200, description: 'Form updated successfully' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: Partial<CreateFormDto>,
  ) {
    return this.formsService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a form' })
  @ApiParam({ name: 'id', description: 'Form ID' })
  @ApiResponse({ status: 200, description: 'Form deleted successfully' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.formsService.remove(id);
  }

  @ApiOperation({ summary: 'Add a column to a form' })
  @ApiResponse({ status: 201, description: 'Form column created successfully' })
  @Post('columns')
  @HttpCode(HttpStatus.CREATED)
  createColumn(@Body() createDto: CreateFormColumnDto) {
    return this.formsService.createColumn(createDto);
  }

  @ApiOperation({ summary: 'Update a form column' })
  @ApiParam({ name: 'id', description: 'Column ID' })
  @ApiResponse({ status: 200, description: 'Form column updated successfully' })
  @Patch('columns/:id')
  updateColumn(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateFormColumnDto>,
  ) {
    return this.formsService.updateColumn(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a form column' })
  @ApiParam({ name: 'id', description: 'Column ID' })
  @ApiResponse({ status: 200, description: 'Form column deleted successfully' })
  @Delete('columns/:id')
  @HttpCode(HttpStatus.OK)
  removeColumn(@Param('id') id: string) {
    return this.formsService.removeColumn(id);
  }
}
