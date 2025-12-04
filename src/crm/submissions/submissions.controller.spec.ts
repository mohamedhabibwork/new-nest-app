import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let submissionsService: jest.Mocked<SubmissionsService>;

  const mockSubmissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        {
          provide: SubmissionsService,
          useValue: mockSubmissionsService,
        },
      ],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
    submissionsService = module.get(SubmissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateSubmissionDto = {
      formId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      values: {
        email: 'test@example.com',
        name: 'John Doe',
      },
    };

    it('should create a submission successfully', async () => {
      const mockSubmission = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        formId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        createdAt: new Date(),
      };

      submissionsService.create.mockResolvedValue(mockSubmission);

      const result = await controller.create(createDto);

      expect(submissionsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException when form not found', async () => {
      submissionsService.create.mockRejectedValue(new NotFoundException('Form not found'));

      await expect(controller.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when invalid field values', async () => {
      submissionsService.create.mockRejectedValue(
        new BadRequestException('Invalid field values'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated submissions', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            formId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            createdAt: new Date(),
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

      submissionsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 50, '01ARZ3NDEKTSV4RRFFQ69G5FAV', undefined);

      expect(submissionsService.findAll).toHaveBeenCalledWith(
        1,
        50,
        '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        undefined,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const submissionId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return submission by ID', async () => {
      const mockSubmission = {
        id: submissionId,
        formId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        values: [],
        createdAt: new Date(),
      };

      submissionsService.findOne.mockResolvedValue(mockSubmission);

      const result = await controller.findOne(submissionId);

      expect(submissionsService.findOne).toHaveBeenCalledWith(submissionId);
      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException when submission not found', async () => {
      submissionsService.findOne.mockRejectedValue(new NotFoundException('Submission not found'));

      await expect(controller.findOne(submissionId)).rejects.toThrow(NotFoundException);
    });
  });
});

