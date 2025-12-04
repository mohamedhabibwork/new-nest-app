import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CreateEmailCampaignDto } from './dto/create-campaign.dto';

describe('CampaignsController', () => {
  let controller: CampaignsController;
  let campaignsService: jest.Mocked<CampaignsService>;

  const mockCampaignsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    recordEmailEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CampaignsService,
          useValue: mockCampaignsService,
        },
      ],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);
    campaignsService = module.get(CampaignsService);
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

    const createDto: CreateEmailCampaignDto = {
      name: 'Welcome Campaign',
      segmentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      subject: 'Welcome!',
      body: 'Welcome to our service',
      status: 'draft',
    };

    it('should create a campaign successfully', async () => {
      const mockCampaign = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'Welcome Campaign',
        segmentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        subject: 'Welcome!',
        status: 'draft',
        createdBy: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      campaignsService.create.mockResolvedValue(mockCampaign);

      const result = await controller.create(mockRequest, createDto);

      expect(campaignsService.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
      expect(result).toEqual(mockCampaign);
    });
  });

  describe('findAll', () => {
    it('should return paginated campaigns', async () => {
      const mockResponse = {
        data: [
          {
            id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
            name: 'Welcome Campaign',
            status: 'draft',
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

      campaignsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(1, 50, 'draft');

      expect(campaignsService.findAll).toHaveBeenCalledWith(1, 50, 'draft');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const campaignId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return campaign by ID', async () => {
      const mockCampaign = {
        id: campaignId,
        name: 'Welcome Campaign',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      campaignsService.findOne.mockResolvedValue(mockCampaign);

      const result = await controller.findOne(campaignId);

      expect(campaignsService.findOne).toHaveBeenCalledWith(campaignId);
      expect(result).toEqual(mockCampaign);
    });

    it('should throw NotFoundException when campaign not found', async () => {
      campaignsService.findOne.mockRejectedValue(new NotFoundException('Campaign not found'));

      await expect(controller.findOne(campaignId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const campaignId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: Partial<CreateEmailCampaignDto> = {
      name: 'Updated Campaign Name',
    };

    it('should update campaign successfully', async () => {
      const mockCampaign = {
        id: campaignId,
        name: 'Updated Campaign Name',
        status: 'draft',
        updatedAt: new Date(),
      };

      campaignsService.update.mockResolvedValue(mockCampaign);

      const result = await controller.update(campaignId, mockRequest, updateDto);

      expect(campaignsService.update).toHaveBeenCalledWith(
        campaignId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockCampaign);
    });
  });

  describe('remove', () => {
    const campaignId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete campaign successfully', async () => {
      campaignsService.remove.mockResolvedValue({
        message: 'Campaign deleted successfully',
      });

      const result = await controller.remove(campaignId);

      expect(campaignsService.remove).toHaveBeenCalledWith(campaignId);
      expect(result).toEqual({ message: 'Campaign deleted successfully' });
    });
  });

  describe('recordEvent', () => {
    const emailSendId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const body = {
      eventType: 'opened',
      eventData: { timestamp: new Date().toISOString() },
    };

    it('should record email event successfully', async () => {
      const mockEvent = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        emailSendId: emailSendId,
        eventType: 'opened',
        createdAt: new Date(),
      };

      campaignsService.recordEmailEvent.mockResolvedValue(mockEvent);

      const result = await controller.recordEvent(emailSendId, body);

      expect(campaignsService.recordEmailEvent).toHaveBeenCalledWith(
        emailSendId,
        body.eventType,
        body.eventData,
      );
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException when emailSend not found', async () => {
      campaignsService.recordEmailEvent.mockRejectedValue(
        new NotFoundException('EmailSend not found'),
      );

      await expect(controller.recordEvent(emailSendId, body)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when invalid event type', async () => {
      campaignsService.recordEmailEvent.mockRejectedValue(
        new BadRequestException('Invalid event type'),
      );

      await expect(controller.recordEvent(emailSendId, body)).rejects.toThrow(BadRequestException);
    });
  });
});

