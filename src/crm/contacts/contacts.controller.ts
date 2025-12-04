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
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactResponseDto } from './dto/contact-response.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('contacts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'contacts', version: '1' })
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @ApiOperation({ summary: 'Create a new contact' })
  @ApiResponse({
    status: 201,
    description: 'Contact created successfully',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateContactDto,
  ) {
    return this.contactsService.create(req.user.id, createDto);
  }

  @ApiOperation({ summary: 'Get all contacts with pagination, filtering, and sorting' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 50 })
  @ApiQuery({ name: 'companyId', required: false, type: String, description: 'Filter by company ID' })
  @ApiQuery({ name: 'lifecycleStage', required: false, enum: ['lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist', 'other'], description: 'Filter by lifecycle stage' })
  @ApiQuery({ name: 'leadStatus', required: false, enum: ['new', 'contacted', 'qualified', 'unqualified', 'lost'], description: 'Filter by lead status' })
  @ApiQuery({ name: 'ownerId', required: false, type: String, description: 'Filter by owner ID' })
  @ApiQuery({ name: 'leadSource', required: false, type: String, description: 'Filter by lead source' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name, email, phone' })
  @ApiQuery({ name: 'minLeadScore', required: false, type: Number, description: 'Filter by minimum lead score' })
  @ApiQuery({ name: 'maxLeadScore', required: false, type: Number, description: 'Filter by maximum lead score' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'lastContacted', 'leadScore', 'email', 'firstName', 'lastName'], description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Include deleted contacts' })
  @ApiResponse({
    status: 200,
    description: 'List of contacts with pagination',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll(@Query() queryDto: ContactQueryDto) {
    return this.contactsService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Contact details',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a contact' })
  @ApiParam({ name: 'id', description: 'Contact ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Contact updated successfully',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a contact (soft delete)' })
  @ApiParam({ name: 'id', description: 'Contact ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'Contact deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.contactsService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update contact lead score' })
  @ApiParam({ name: 'id', description: 'Contact ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiQuery({ name: 'score', required: true, type: Number, description: 'Lead score (0-100)' })
  @ApiResponse({
    status: 200,
    description: 'Lead score updated successfully',
    type: ContactResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @ApiResponse({ status: 400, description: 'Invalid score range' })
  @Patch(':id/lead-score')
  updateLeadScore(
    @Param('id') id: string,
    @Query('score', new ParseIntPipe()) score: number,
  ) {
    return this.contactsService.updateLeadScore(id, score);
  }
}

