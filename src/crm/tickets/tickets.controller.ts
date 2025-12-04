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
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';

@ApiTags('tickets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tickets', version: '1' })
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: TicketResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateTicketDto,
  ) {
    return this.ticketsService.create(req.user.id, createDto);
  }

  @ApiOperation({
    summary: 'Get all tickets with pagination, filtering, and sorting',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'contactId', required: false, type: String })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['new', 'open', 'pending', 'resolved', 'closed'],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['low', 'normal', 'high', 'urgent'],
  })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'priority', 'status'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'List of tickets with pagination',
    type: TicketResponseDto,
  })
  @Get()
  findAll(@Query() queryDto: TicketQueryDto) {
    return this.ticketsService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket details',
    type: TicketResponseDto,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
    type: TicketResponseDto,
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, req.user.id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.ticketsService.remove(id, req.user.id);
  }

  // Comment endpoints removed - use CollaborationModule for polymorphic comments
}
