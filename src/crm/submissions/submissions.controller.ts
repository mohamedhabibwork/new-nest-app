import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
  ApiQuery,
} from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@ApiTags('submissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'submissions', version: '1' })
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({ summary: 'Create a new form submission' })
  @ApiResponse({ status: 201, description: 'Submission created successfully' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateSubmissionDto) {
    return this.submissionsService.create(createDto);
  }

  @ApiOperation({ summary: 'Get all submissions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'formId', required: false, type: String })
  @ApiQuery({ name: 'contactId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of submissions' })
  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('formId') formId?: string,
    @Query('contactId') contactId?: string,
  ) {
    return this.submissionsService.findAll(page, limit, formId, contactId);
  }

  @ApiOperation({ summary: 'Get a submission by ID' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }
}
