import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { CreateFormColumnDto } from './dto/create-form-column.dto';

describe('FormsController', () => {
  let controller: FormsController;
  let formsService: jest.Mocked<FormsService>;

  const mockFormsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createColumn: jest.fn(),
    updateColumn: jest.fn(),
    removeColumn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormsController],
      providers: [
        {
          provide: FormsService,
          useValue: mockFormsService,
        },
      ],
    }).compile();

    controller = module.get<FormsController>(FormsController);
    formsService = module.get(FormsService);
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

    const createDto: CreateFormDto = {
      name: 'Contact Form',
      formType: 'lead_capture',
      status: 'active',
    };

    it('should create a form successfully', async () => {
      const mockForm = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'Contact Form',
        formType: 'lead_capture',
        status: 'active',
        createdBy: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      formsService.create.mockResolvedValue(mockForm);

      const result = await controller.create(mockRequest, createDto);

      expect(formsService.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
      expect(result).toEqual(mockForm);
    });
  });

  describe('findAll', () => {
    it('should return paginated forms', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            name: 'Contact Form',
            formType: 'lead_capture',
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

      formsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 50, 'lead_capture', 'active');

      expect(formsService.findAll).toHaveBeenCalledWith(1, 50, 'lead_capture', 'active');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const formId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return form by ID', async () => {
      const mockForm = {
        id: formId,
        name: 'Contact Form',
        formType: 'lead_capture',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      formsService.findOne.mockResolvedValue(mockForm);

      const result = await controller.findOne(formId);

      expect(formsService.findOne).toHaveBeenCalledWith(formId);
      expect(result).toEqual(mockForm);
    });

    it('should throw NotFoundException when form not found', async () => {
      formsService.findOne.mockRejectedValue(new NotFoundException('Form not found'));

      await expect(controller.findOne(formId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const formId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: Partial<CreateFormDto> = {
      name: 'Updated Form Name',
    };

    it('should update form successfully', async () => {
      const mockForm = {
        id: formId,
        name: 'Updated Form Name',
        formType: 'lead_capture',
        updatedAt: new Date(),
      };

      formsService.update.mockResolvedValue(mockForm);

      const result = await controller.update(formId, mockRequest, updateDto);

      expect(formsService.update).toHaveBeenCalledWith(formId, mockRequest.user.id, updateDto);
      expect(result).toEqual(mockForm);
    });
  });

  describe('remove', () => {
    const formId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete form successfully', async () => {
      formsService.remove.mockResolvedValue({
        message: 'Form deleted successfully',
      });

      const result = await controller.remove(formId);

      expect(formsService.remove).toHaveBeenCalledWith(formId);
      expect(result).toEqual({ message: 'Form deleted successfully' });
    });
  });

  describe('createColumn', () => {
    const createColumnDto: CreateFormColumnDto = {
      formId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      columnName: 'email',
      dataType: 'text',
      isRequired: true,
    };

    it('should create form column successfully', async () => {
      const mockColumn = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        formId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        columnName: 'email',
        dataType: 'text',
        isRequired: true,
        createdAt: new Date(),
      };

      formsService.createColumn.mockResolvedValue(mockColumn);

      const result = await controller.createColumn(createColumnDto);

      expect(formsService.createColumn).toHaveBeenCalledWith(createColumnDto);
      expect(result).toEqual(mockColumn);
    });

    it('should throw BadRequestException when invalid field type', async () => {
      formsService.createColumn.mockRejectedValue(
        new BadRequestException('Invalid field type'),
      );

      await expect(controller.createColumn(createColumnDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateColumn', () => {
    const columnId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: Partial<CreateFormColumnDto> = {
      isRequired: false,
    };

    it('should update column successfully', async () => {
      const mockColumn = {
        id: columnId,
        columnName: 'email',
        isRequired: false,
        updatedAt: new Date(),
      };

      formsService.updateColumn.mockResolvedValue(mockColumn);

      const result = await controller.updateColumn(columnId, updateDto);

      expect(formsService.updateColumn).toHaveBeenCalledWith(columnId, updateDto);
      expect(result).toEqual(mockColumn);
    });
  });

  describe('removeColumn', () => {
    const columnId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete column successfully', async () => {
      formsService.removeColumn.mockResolvedValue({
        message: 'Form column deleted successfully',
      });

      const result = await controller.removeColumn(columnId);

      expect(formsService.removeColumn).toHaveBeenCalledWith(columnId);
      expect(result).toEqual({ message: 'Form column deleted successfully' });
    });
  });
});

