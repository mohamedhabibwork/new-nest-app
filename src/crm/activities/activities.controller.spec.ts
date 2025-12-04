import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';

describe('ActivitiesController', () => {
  let controller: ActivitiesController;
  let activitiesService: jest.Mocked<ActivitiesService>;

  const mockActivitiesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: mockActivitiesService,
        },
      ],
    }).compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    activitiesService = module.get(ActivitiesService);
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

    const createDto: CreateActivityDto = {
      activityType: 'call',
      contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      subject: 'Follow-up call',
      description: 'Discussed product features',
      direction: 'outbound',
      activityDate: new Date('2024-12-01T10:00:00.000Z'),
      durationMinutes: 30,
    };

    it('should create an activity successfully', async () => {
      const mockActivity = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        activityType: 'call',
        contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        subject: 'Follow-up call',
        description: 'Discussed product features',
        direction: 'outbound',
        activityDate: new Date('2024-12-01T10:00:00.000Z'),
        durationMinutes: 30,
        userId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      activitiesService.create.mockResolvedValue(mockActivity);

      const result = await controller.create(mockRequest, createDto);

      expect(activitiesService.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundException when contact not found', async () => {
      activitiesService.create.mockRejectedValue(new NotFoundException('Contact not found'));

      await expect(controller.create(mockRequest, createDto)).rejects.toThrow(NotFoundException);
      expect(activitiesService.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
    });

    it('should throw BadRequestException when invalid related entity', async () => {
      activitiesService.create.mockRejectedValue(
        new BadRequestException('At least one related entity (contact, company, or deal) is required'),
      );

      const invalidDto: CreateActivityDto = {
        activityType: 'call',
        activityDate: new Date('2024-12-01T10:00:00.000Z'),
      };

      await expect(controller.create(mockRequest, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    const queryDto: ActivityQueryDto = {
      page: 1,
      limit: 50,
    };

    it('should return paginated activities', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            activityType: 'call',
            subject: 'Follow-up call',
            activityDate: new Date(),
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

      activitiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto);

      expect(activitiesService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered activities by type', async () => {
      const queryDtoWithFilter: ActivityQueryDto = {
        ...queryDto,
        activityType: 'call',
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

      activitiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithFilter);

      expect(activitiesService.findAll).toHaveBeenCalledWith(queryDtoWithFilter);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered activities by contact', async () => {
      const queryDtoWithContact: ActivityQueryDto = {
        ...queryDto,
        contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
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

      activitiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithContact);

      expect(activitiesService.findAll).toHaveBeenCalledWith(queryDtoWithContact);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered activities by date range', async () => {
      const queryDtoWithDate: ActivityQueryDto = {
        ...queryDto,
        activityDateFrom: '2024-12-01',
        activityDateTo: '2024-12-31',
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

      activitiesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithDate);

      expect(activitiesService.findAll).toHaveBeenCalledWith(queryDtoWithDate);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const activityId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return activity by ID', async () => {
      const mockActivity = {
        id: activityId,
        activityType: 'call',
        subject: 'Follow-up call',
        description: 'Discussed product features',
        activityDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      activitiesService.findOne.mockResolvedValue(mockActivity);

      const result = await controller.findOne(activityId);

      expect(activitiesService.findOne).toHaveBeenCalledWith(activityId);
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundException when activity not found', async () => {
      activitiesService.findOne.mockRejectedValue(new NotFoundException('Activity not found'));

      await expect(controller.findOne(activityId)).rejects.toThrow(NotFoundException);
      expect(activitiesService.findOne).toHaveBeenCalledWith(activityId);
    });
  });

  describe('update', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const activityId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateActivityDto = {
      subject: 'Updated subject',
      description: 'Updated description',
    };

    it('should update activity successfully', async () => {
      const mockActivity = {
        id: activityId,
        activityType: 'call',
        subject: 'Updated subject',
        description: 'Updated description',
        activityDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      activitiesService.update.mockResolvedValue(mockActivity);

      const result = await controller.update(activityId, mockRequest, updateDto);

      expect(activitiesService.update).toHaveBeenCalledWith(
        activityId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundException when activity not found', async () => {
      activitiesService.update.mockRejectedValue(new NotFoundException('Activity not found'));

      await expect(controller.update(activityId, mockRequest, updateDto)).rejects.toThrow(
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

    const activityId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete activity successfully', async () => {
      activitiesService.remove.mockResolvedValue({
        message: 'Activity deleted successfully',
      });

      const result = await controller.remove(activityId, mockRequest);

      expect(activitiesService.remove).toHaveBeenCalledWith(activityId, mockRequest.user.id);
      expect(result).toEqual({ message: 'Activity deleted successfully' });
    });

    it('should throw NotFoundException when activity not found', async () => {
      activitiesService.remove.mockRejectedValue(new NotFoundException('Activity not found'));

      await expect(controller.remove(activityId, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });
});

