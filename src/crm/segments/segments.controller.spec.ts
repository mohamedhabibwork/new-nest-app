import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SegmentsController } from './segments.controller';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto } from './dto/create-segment.dto';

describe('SegmentsController', () => {
  let controller: SegmentsController;
  let segmentsService: jest.Mocked<SegmentsService>;

  const mockSegmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getContacts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SegmentsController],
      providers: [
        {
          provide: SegmentsService,
          useValue: mockSegmentsService,
        },
      ],
    }).compile();

    controller = module.get<SegmentsController>(SegmentsController);
    segmentsService = module.get(SegmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateSegmentDto = {
      name: 'VIP Customers',
      segmentType: 'dynamic',
      criteria: [],
    };

    it('should create a segment successfully', async () => {
      const mockSegment = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'VIP Customers',
        segmentType: 'dynamic',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      segmentsService.create.mockResolvedValue(mockSegment);

      const result = await controller.create(createDto);

      expect(segmentsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockSegment);
    });

    it('should throw BadRequestException when invalid criteria', async () => {
      segmentsService.create.mockRejectedValue(
        new BadRequestException('Invalid criteria'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all segments', async () => {
      const mockSegments = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          name: 'VIP Customers',
          segmentType: 'dynamic',
        },
      ];

      segmentsService.findAll.mockResolvedValue(mockSegments);

      const result = await controller.findAll();

      expect(segmentsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSegments);
    });
  });

  describe('findOne', () => {
    const segmentId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return segment by ID', async () => {
      const mockSegment = {
        id: segmentId,
        name: 'VIP Customers',
        segmentType: 'dynamic',
        criteria: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      segmentsService.findOne.mockResolvedValue(mockSegment);

      const result = await controller.findOne(segmentId);

      expect(segmentsService.findOne).toHaveBeenCalledWith(segmentId);
      expect(result).toEqual(mockSegment);
    });

    it('should throw NotFoundException when segment not found', async () => {
      segmentsService.findOne.mockRejectedValue(
        new NotFoundException('Segment not found'),
      );

      await expect(controller.findOne(segmentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const segmentId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: Partial<CreateSegmentDto> = {
      name: 'Updated Segment Name',
    };

    it('should update segment successfully', async () => {
      const mockSegment = {
        id: segmentId,
        name: 'Updated Segment Name',
        segmentType: 'dynamic',
        updatedAt: new Date(),
      };

      segmentsService.update.mockResolvedValue(mockSegment);

      const result = await controller.update(segmentId, updateDto);

      expect(segmentsService.update).toHaveBeenCalledWith(segmentId, updateDto);
      expect(result).toEqual(mockSegment);
    });
  });

  describe('remove', () => {
    const segmentId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete segment successfully', async () => {
      segmentsService.remove.mockResolvedValue({
        message: 'Segment deleted successfully',
      });

      const result = await controller.remove(segmentId);

      expect(segmentsService.remove).toHaveBeenCalledWith(segmentId);
      expect(result).toEqual({ message: 'Segment deleted successfully' });
    });
  });

  describe('getContacts', () => {
    const segmentId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return contacts in segment', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            email: 'test@example.com',
            firstName: 'John',
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

      segmentsService.getContacts.mockResolvedValue(mockResponse);

      const result = await controller.getContacts(segmentId, 1, 50);

      expect(segmentsService.getContacts).toHaveBeenCalledWith(
        segmentId,
        1,
        50,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
