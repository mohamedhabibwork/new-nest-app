import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealQueryDto } from './dto/deal-query.dto';

describe('DealsController', () => {
  let controller: DealsController;
  let dealsService: jest.Mocked<DealsService>;

  const mockDealsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    moveToStage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealsController],
      providers: [
        {
          provide: DealsService,
          useValue: mockDealsService,
        },
      ],
    }).compile();

    controller = module.get<DealsController>(DealsController);
    dealsService = module.get(DealsService);
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

    const createDto: CreateDealDto = {
      pipelineId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      stageId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      name: 'New Deal',
      amount: 10000,
    };

    it('should create a deal successfully', async () => {
      const mockDeal = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        pipelineId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        stageId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'New Deal',
        amount: 10000,
        ownerId: mockRequest.user.id,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dealsService.create.mockResolvedValue(mockDeal);

      const result = await controller.create(mockRequest, createDto);

      expect(dealsService.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
      expect(result).toEqual(mockDeal);
    });

    it('should throw NotFoundException when pipeline not found', async () => {
      dealsService.create.mockRejectedValue(new NotFoundException('Pipeline not found'));

      await expect(controller.create(mockRequest, createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const queryDto: DealQueryDto = {
      page: 1,
      limit: 50,
    };

    it('should return paginated deals', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            name: 'New Deal',
            amount: 10000,
            status: 'open',
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

      dealsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto);

      expect(dealsService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered deals by pipeline', async () => {
      const queryDtoWithFilter: DealQueryDto = {
        ...queryDto,
        pipelineId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
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

      dealsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDtoWithFilter);

      expect(dealsService.findAll).toHaveBeenCalledWith(queryDtoWithFilter);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const dealId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return deal by ID', async () => {
      const mockDeal = {
        id: dealId,
        name: 'New Deal',
        amount: 10000,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dealsService.findOne.mockResolvedValue(mockDeal);

      const result = await controller.findOne(dealId);

      expect(dealsService.findOne).toHaveBeenCalledWith(dealId);
      expect(result).toEqual(mockDeal);
    });

    it('should throw NotFoundException when deal not found', async () => {
      dealsService.findOne.mockRejectedValue(new NotFoundException('Deal not found'));

      await expect(controller.findOne(dealId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const dealId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateDealDto = {
      name: 'Updated Deal Name',
      amount: 20000,
    };

    it('should update deal successfully', async () => {
      const mockDeal = {
        id: dealId,
        name: 'Updated Deal Name',
        amount: 20000,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dealsService.update.mockResolvedValue(mockDeal);

      const result = await controller.update(dealId, mockRequest, updateDto);

      expect(dealsService.update).toHaveBeenCalledWith(dealId, mockRequest.user.id, updateDto);
      expect(result).toEqual(mockDeal);
    });

    it('should throw NotFoundException when deal not found', async () => {
      dealsService.update.mockRejectedValue(new NotFoundException('Deal not found'));

      await expect(controller.update(dealId, mockRequest, updateDto)).rejects.toThrow(
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

    const dealId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete deal successfully', async () => {
      dealsService.remove.mockResolvedValue({
        message: 'Deal deleted successfully',
      });

      const result = await controller.remove(dealId, mockRequest);

      expect(dealsService.remove).toHaveBeenCalledWith(dealId, mockRequest.user.id);
      expect(result).toEqual({ message: 'Deal deleted successfully' });
    });

    it('should throw NotFoundException when deal not found', async () => {
      dealsService.remove.mockRejectedValue(new NotFoundException('Deal not found'));

      await expect(controller.remove(dealId, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });

  describe('moveToStage', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const dealId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const stageId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should move deal to stage successfully', async () => {
      const mockDeal = {
        id: dealId,
        stageId: stageId,
        name: 'New Deal',
        status: 'open',
        updatedAt: new Date(),
      };

      dealsService.moveToStage.mockResolvedValue(mockDeal);

      const result = await controller.moveToStage(dealId, stageId, mockRequest);

      expect(dealsService.moveToStage).toHaveBeenCalledWith(dealId, stageId, mockRequest.user.id);
      expect(result).toEqual(mockDeal);
    });

    it('should throw NotFoundException when deal not found', async () => {
      dealsService.moveToStage.mockRejectedValue(new NotFoundException('Deal not found'));

      await expect(controller.moveToStage(dealId, stageId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when invalid stage transition', async () => {
      dealsService.moveToStage.mockRejectedValue(
        new BadRequestException('Invalid stage transition'),
      );

      await expect(controller.moveToStage(dealId, stageId, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

