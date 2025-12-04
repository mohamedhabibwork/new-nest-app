import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';

describe('TicketsController', () => {
  let controller: TicketsController;
  let ticketsService: jest.Mocked<TicketsService>;

  const mockTicketsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    ticketsService = module.get(TicketsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const createDto: CreateTicketDto = {
      contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      subject: 'Support Request',
      description: 'Need help with product',
      priority: 'high',
      category: 'technical',
    };

    it('should create a ticket successfully with ticket number', async () => {
      const mockTicket = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        ticketNumber: 'TKT-000001',
        contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        subject: 'Support Request',
        description: 'Need help with product',
        priority: 'high',
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ticketsService.create.mockResolvedValue(mockTicket);

      const result = await controller.create(mockRequest, createDto);

      expect(ticketsService.create).toHaveBeenCalledWith(
        mockRequest.user.id,
        createDto,
      );
      expect(result).toEqual(mockTicket);
      expect(result.ticketNumber).toMatch(/^TKT-\d+$/);
    });

    it('should throw NotFoundException when contact not found', async () => {
      ticketsService.create.mockRejectedValue(
        new NotFoundException('Contact not found'),
      );

      await expect(controller.create(mockRequest, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    const queryDto: TicketQueryDto = {
      page: 1,
      limit: 50,
    };

    it('should return paginated tickets', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            ticketNumber: 'TKT-000001',
            subject: 'Support Request',
            status: 'new',
          },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      ticketsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto);

      expect(ticketsService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered tickets by status', async () => {
      const queryDtoWithFilter: TicketQueryDto = {
        ...queryDto,
        status: 'open',
      };

      const mockResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };

      ticketsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithFilter);

      expect(ticketsService.findAll).toHaveBeenCalledWith(queryDtoWithFilter);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const ticketId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return ticket by ID', async () => {
      const mockTicket = {
        id: ticketId,
        ticketNumber: 'TKT-000001',
        subject: 'Support Request',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ticketsService.findOne.mockResolvedValue(mockTicket);

      const result = await controller.findOne(ticketId);

      expect(ticketsService.findOne).toHaveBeenCalledWith(ticketId);
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException when ticket not found', async () => {
      ticketsService.findOne.mockRejectedValue(
        new NotFoundException('Ticket not found'),
      );

      await expect(controller.findOne(ticketId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const ticketId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateTicketDto = {
      status: 'resolved',
      priority: 'normal',
    };

    it('should update ticket successfully', async () => {
      const mockTicket = {
        id: ticketId,
        ticketNumber: 'TKT-000001',
        status: 'resolved',
        priority: 'normal',
        updatedAt: new Date(),
      };

      ticketsService.update.mockResolvedValue(mockTicket);

      const result = await controller.update(ticketId, mockRequest, updateDto);

      expect(ticketsService.update).toHaveBeenCalledWith(
        ticketId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException when ticket not found', async () => {
      ticketsService.update.mockRejectedValue(
        new NotFoundException('Ticket not found'),
      );

      await expect(
        controller.update(ticketId, mockRequest, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when invalid status transition', async () => {
      ticketsService.update.mockRejectedValue(
        new BadRequestException('Invalid status transition'),
      );

      await expect(
        controller.update(ticketId, mockRequest, updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const ticketId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete ticket successfully', async () => {
      ticketsService.remove.mockResolvedValue({
        message: 'Ticket deleted successfully',
      });

      const result = await controller.remove(ticketId, mockRequest);

      expect(ticketsService.remove).toHaveBeenCalledWith(
        ticketId,
        mockRequest.user.id,
      );
      expect(result).toEqual({ message: 'Ticket deleted successfully' });
    });

    it('should throw NotFoundException when ticket not found', async () => {
      ticketsService.remove.mockRejectedValue(
        new NotFoundException('Ticket not found'),
      );

      await expect(controller.remove(ticketId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Comment methods removed - use CollaborationModule instead
});
