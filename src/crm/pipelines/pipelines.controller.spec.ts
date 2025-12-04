import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';

describe('PipelinesController', () => {
  let controller: PipelinesController;
  let pipelinesService: jest.Mocked<PipelinesService>;

  const mockPipelinesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createStage: jest.fn(),
    findAllStages: jest.fn(),
    findOneStage: jest.fn(),
    updateStage: jest.fn(),
    removeStage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelinesController],
      providers: [
        {
          provide: PipelinesService,
          useValue: mockPipelinesService,
        },
      ],
    }).compile();

    controller = module.get<PipelinesController>(PipelinesController);
    pipelinesService = module.get(PipelinesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreatePipelineDto = {
      name: 'Sales Pipeline',
      description: 'Main sales pipeline',
      isDefault: false,
      displayOrder: 0,
    };

    it('should create a pipeline successfully', async () => {
      const mockPipeline = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'Sales Pipeline',
        description: 'Main sales pipeline',
        isDefault: false,
        displayOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      pipelinesService.create.mockResolvedValue(mockPipeline);

      const result = await controller.create(createDto);

      expect(pipelinesService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPipeline);
    });
  });

  describe('findAll', () => {
    it('should return all pipelines', async () => {
      const mockPipelines = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          name: 'Sales Pipeline',
          isDefault: false,
        },
      ];

      pipelinesService.findAll.mockResolvedValue(mockPipelines);

      const result = await controller.findAll();

      expect(pipelinesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockPipelines);
    });
  });

  describe('findOne', () => {
    const pipelineId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return pipeline by ID', async () => {
      const mockPipeline = {
        id: pipelineId,
        name: 'Sales Pipeline',
        description: 'Main sales pipeline',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      pipelinesService.findOne.mockResolvedValue(mockPipeline);

      const result = await controller.findOne(pipelineId);

      expect(pipelinesService.findOne).toHaveBeenCalledWith(pipelineId);
      expect(result).toEqual(mockPipeline);
    });

    it('should throw NotFoundException when pipeline not found', async () => {
      pipelinesService.findOne.mockRejectedValue(new NotFoundException('Pipeline not found'));

      await expect(controller.findOne(pipelineId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const pipelineId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdatePipelineDto = {
      name: 'Updated Pipeline Name',
    };

    it('should update pipeline successfully', async () => {
      const mockPipeline = {
        id: pipelineId,
        name: 'Updated Pipeline Name',
        description: 'Main sales pipeline',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      pipelinesService.update.mockResolvedValue(mockPipeline);

      const result = await controller.update(pipelineId, updateDto);

      expect(pipelinesService.update).toHaveBeenCalledWith(pipelineId, updateDto);
      expect(result).toEqual(mockPipeline);
    });

    it('should throw NotFoundException when pipeline not found', async () => {
      pipelinesService.update.mockRejectedValue(new NotFoundException('Pipeline not found'));

      await expect(controller.update(pipelineId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const pipelineId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete pipeline successfully', async () => {
      pipelinesService.remove.mockResolvedValue({
        message: 'Pipeline deleted successfully',
      });

      const result = await controller.remove(pipelineId);

      expect(pipelinesService.remove).toHaveBeenCalledWith(pipelineId);
      expect(result).toEqual({ message: 'Pipeline deleted successfully' });
    });

    it('should throw NotFoundException when pipeline not found', async () => {
      pipelinesService.remove.mockRejectedValue(new NotFoundException('Pipeline not found'));

      await expect(controller.remove(pipelineId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when pipeline has deals', async () => {
      pipelinesService.remove.mockRejectedValue(
        new BadRequestException('Cannot delete pipeline with deals'),
      );

      await expect(controller.remove(pipelineId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createStage', () => {
    const createStageDto: CreatePipelineStageDto = {
      pipelineId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      name: 'Qualification',
      displayOrder: 0,
      probability: 10,
    };

    it('should create a pipeline stage successfully', async () => {
      const mockStage = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        pipelineId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'Qualification',
        displayOrder: 0,
        probability: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      pipelinesService.createStage.mockResolvedValue(mockStage);

      const result = await controller.createStage(createStageDto);

      expect(pipelinesService.createStage).toHaveBeenCalledWith(createStageDto);
      expect(result).toEqual(mockStage);
    });

    it('should throw NotFoundException when pipeline not found', async () => {
      pipelinesService.createStage.mockRejectedValue(new NotFoundException('Pipeline not found'));

      await expect(controller.createStage(createStageDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when duplicate stage name', async () => {
      pipelinesService.createStage.mockRejectedValue(
        new BadRequestException('Stage with this name already exists in pipeline'),
      );

      await expect(controller.createStage(createStageDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllStages', () => {
    const pipelineId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return all stages for a pipeline', async () => {
      const mockStages = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          name: 'Qualification',
          displayOrder: 0,
        },
      ];

      pipelinesService.findAllStages.mockResolvedValue(mockStages);

      const result = await controller.findAllStages(pipelineId);

      expect(pipelinesService.findAllStages).toHaveBeenCalledWith(pipelineId);
      expect(result).toEqual(mockStages);
    });
  });

  describe('findOneStage', () => {
    const stageId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return stage by ID', async () => {
      const mockStage = {
        id: stageId,
        pipelineId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'Qualification',
        displayOrder: 0,
        probability: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      pipelinesService.findOneStage.mockResolvedValue(mockStage);

      const result = await controller.findOneStage(stageId);

      expect(pipelinesService.findOneStage).toHaveBeenCalledWith(stageId);
      expect(result).toEqual(mockStage);
    });

    it('should throw NotFoundException when stage not found', async () => {
      pipelinesService.findOneStage.mockRejectedValue(new NotFoundException('Stage not found'));

      await expect(controller.findOneStage(stageId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStage', () => {
    const stageId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdatePipelineStageDto = {
      name: 'Updated Stage Name',
      probability: 20,
    };

    it('should update stage successfully', async () => {
      const mockStage = {
        id: stageId,
        pipelineId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'Updated Stage Name',
        displayOrder: 0,
        probability: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      pipelinesService.updateStage.mockResolvedValue(mockStage);

      const result = await controller.updateStage(stageId, updateDto);

      expect(pipelinesService.updateStage).toHaveBeenCalledWith(stageId, updateDto);
      expect(result).toEqual(mockStage);
    });

    it('should throw NotFoundException when stage not found', async () => {
      pipelinesService.updateStage.mockRejectedValue(new NotFoundException('Stage not found'));

      await expect(controller.updateStage(stageId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeStage', () => {
    const stageId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete stage successfully', async () => {
      pipelinesService.removeStage.mockResolvedValue({
        message: 'Pipeline stage deleted successfully',
      });

      const result = await controller.removeStage(stageId);

      expect(pipelinesService.removeStage).toHaveBeenCalledWith(stageId);
      expect(result).toEqual({ message: 'Pipeline stage deleted successfully' });
    });

    it('should throw NotFoundException when stage not found', async () => {
      pipelinesService.removeStage.mockRejectedValue(new NotFoundException('Stage not found'));

      await expect(controller.removeStage(stageId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when stage has deals', async () => {
      pipelinesService.removeStage.mockRejectedValue(
        new BadRequestException('Cannot delete stage with deals'),
      );

      await expect(controller.removeStage(stageId)).rejects.toThrow(BadRequestException);
    });
  });
});

