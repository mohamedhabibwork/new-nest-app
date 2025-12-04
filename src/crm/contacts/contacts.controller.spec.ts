import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactQueryDto } from './dto/contact-query.dto';

describe('ContactsController', () => {
  let controller: ContactsController;
  let contactsService: jest.Mocked<ContactsService>;

  const mockContactsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateLeadScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: mockContactsService,
        },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    contactsService = module.get(ContactsService);
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

    const createDto: CreateContactDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      lifecycleStage: 'lead',
      leadStatus: 'new',
    };

    it('should create a contact successfully', async () => {
      const mockContact = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        lifecycleStage: 'lead',
        leadStatus: 'new',
        leadScore: 0,
        ownerId: mockRequest.user.id,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: null,
        owner: {
          id: mockRequest.user.id,
          email: 'owner@example.com',
          firstName: 'Owner',
          lastName: 'User',
        },
      };

      contactsService.create.mockResolvedValue(mockContact);

      const result = await controller.create(mockRequest, createDto);

      expect(contactsService.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
      expect(result).toEqual(mockContact);
    });

    it('should throw BadRequestException when email already exists', async () => {
      contactsService.create.mockRejectedValue(
        new BadRequestException('Contact with this email already exists'),
      );

      await expect(controller.create(mockRequest, createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(contactsService.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
    });

    it('should throw NotFoundException when company not found', async () => {
      const createDtoWithCompany: CreateContactDto = {
        ...createDto,
        companyId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      };

      contactsService.create.mockRejectedValue(new NotFoundException('Company not found'));

      await expect(controller.create(mockRequest, createDtoWithCompany)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    const queryDto: ContactQueryDto = {
      page: 1,
      limit: 50,
    };

    it('should return paginated contacts', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
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

      contactsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto);

      expect(contactsService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered contacts by lifecycle stage', async () => {
      const queryDtoWithFilter: ContactQueryDto = {
        ...queryDto,
        lifecycleStage: 'lead',
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

      contactsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithFilter);

      expect(contactsService.findAll).toHaveBeenCalledWith(queryDtoWithFilter);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered contacts by search', async () => {
      const queryDtoWithSearch: ContactQueryDto = {
        ...queryDto,
        search: 'John',
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

      contactsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithSearch);

      expect(contactsService.findAll).toHaveBeenCalledWith(queryDtoWithSearch);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered contacts by lead score range', async () => {
      const queryDtoWithScore: ContactQueryDto = {
        ...queryDto,
        minLeadScore: 50,
        maxLeadScore: 100,
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

      contactsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithScore);

      expect(contactsService.findAll).toHaveBeenCalledWith(queryDtoWithScore);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const contactId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return contact by ID', async () => {
      const mockContact = {
        id: contactId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        lifecycleStage: 'lead',
        leadStatus: 'new',
        leadScore: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contactsService.findOne.mockResolvedValue(mockContact);

      const result = await controller.findOne(contactId);

      expect(contactsService.findOne).toHaveBeenCalledWith(contactId);
      expect(result).toEqual(mockContact);
    });

    it('should throw NotFoundException when contact not found', async () => {
      contactsService.findOne.mockRejectedValue(new NotFoundException('Contact not found'));

      await expect(controller.findOne(contactId)).rejects.toThrow(NotFoundException);
      expect(contactsService.findOne).toHaveBeenCalledWith(contactId);
    });
  });

  describe('update', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const contactId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateContactDto = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should update contact successfully', async () => {
      const mockContact = {
        id: contactId,
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567890',
        lifecycleStage: 'lead',
        leadStatus: 'new',
        leadScore: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contactsService.update.mockResolvedValue(mockContact);

      const result = await controller.update(contactId, mockRequest, updateDto);

      expect(contactsService.update).toHaveBeenCalledWith(
        contactId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockContact);
    });

    it('should throw NotFoundException when contact not found', async () => {
      contactsService.update.mockRejectedValue(new NotFoundException('Contact not found'));

      await expect(controller.update(contactId, mockRequest, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const contactId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete contact successfully', async () => {
      contactsService.remove.mockResolvedValue({
        message: 'Contact deleted successfully',
      });

      const result = await controller.remove(contactId, mockRequest);

      expect(contactsService.remove).toHaveBeenCalledWith(contactId, mockRequest.user.id);
      expect(result).toEqual({ message: 'Contact deleted successfully' });
    });

    it('should throw NotFoundException when contact not found', async () => {
      contactsService.remove.mockRejectedValue(new NotFoundException('Contact not found'));

      await expect(controller.remove(contactId, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLeadScore', () => {
    const contactId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const score = 75;

    it('should update lead score successfully', async () => {
      const mockContact = {
        id: contactId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        leadScore: 75,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contactsService.updateLeadScore.mockResolvedValue(mockContact);

      const result = await controller.updateLeadScore(contactId, score);

      expect(contactsService.updateLeadScore).toHaveBeenCalledWith(contactId, score);
      expect(result).toEqual(mockContact);
    });

    it('should throw NotFoundException when contact not found', async () => {
      contactsService.updateLeadScore.mockRejectedValue(
        new NotFoundException('Contact not found'),
      );

      await expect(controller.updateLeadScore(contactId, score)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when score is invalid', async () => {
      contactsService.updateLeadScore.mockRejectedValue(
        new BadRequestException('Invalid score range'),
      );

      await expect(controller.updateLeadScore(contactId, score)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

