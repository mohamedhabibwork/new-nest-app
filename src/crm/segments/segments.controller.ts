import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
} from '@nestjs/swagger';
import { SegmentsService } from './segments.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateSegmentDto } from './dto/create-segment.dto';

@ApiTags('segments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'segments', version: '1' })
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @ApiOperation({ summary: 'Create a new contact segment' })
  @ApiResponse({ status: 201, description: 'Segment created successfully' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateSegmentDto) {
    return this.segmentsService.create(createDto);
  }

  @ApiOperation({ summary: 'Get all contact segments' })
  @ApiResponse({ status: 200, description: 'List of segments' })
  @Get()
  findAll() {
    return this.segmentsService.findAll();
  }

  @ApiOperation({ summary: 'Get a segment by ID' })
  @ApiParam({ name: 'id', description: 'Segment ID' })
  @ApiResponse({ status: 200, description: 'Segment details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.segmentsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a segment' })
  @ApiParam({ name: 'id', description: 'Segment ID' })
  @ApiResponse({ status: 200, description: 'Segment updated successfully' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateSegmentDto>,
  ) {
    return this.segmentsService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a segment' })
  @ApiParam({ name: 'id', description: 'Segment ID' })
  @ApiResponse({ status: 200, description: 'Segment deleted successfully' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.segmentsService.remove(id);
  }

  @ApiOperation({ summary: 'Get contacts in a segment' })
  @ApiParam({ name: 'id', description: 'Segment ID' })
  @ApiResponse({ status: 200, description: 'List of contacts in segment' })
  @Get(':id/contacts')
  getContacts(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.segmentsService.getContacts(id, page, limit);
  }
}

