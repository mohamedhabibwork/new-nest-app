import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

describe('WorkflowsController', () => {
  let controller: WorkflowsController;
  let workflowsService: jest.Mocked<WorkflowsService>;

  const mockWorkflowsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowsController],
      providers: [
        {
          provide: WorkflowsService,
          useValue: mockWorkflowsService,
        },
      ],
    }).compile();

    controller = module.get<WorkflowsController>(WorkflowsController);
    workflowsService = module.get(WorkflowsService);
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

    const createDto: CreateWorkflowDto = {
      name: 'Welcome Workflow',
      triggerType: 'form_submission',
      isActive: true,
      actions: [],
    };

    it('should create a workflow successfully', async () => {
      const mockWorkflow = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        name: 'Welcome Workflow',
        triggerType: 'form_submission',
        isActive: true,
        createdBy: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workflowsService.create.mockResolvedValue(mockWorkflow);

      const result = await controller.create(mockRequest, createDto);

      expect(workflowsService.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
      expect(result).toEqual(mockWorkflow);
    });

    it('should throw BadRequestException when invalid trigger/action', async () => {
      workflowsService.create.mockRejectedValue(
        new BadRequestException('Invalid trigger type'),
      );

      await expect(controller.create(mockRequest, createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all workflows', async () => {
      const mockWorkflows = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          name: 'Welcome Workflow',
          triggerType: 'form_submission',
          isActive: true,
        },
      ];

      workflowsService.findAll.mockResolvedValue(mockWorkflows);

      const result = await controller.findAll();

      expect(workflowsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockWorkflows);
    });
  });

  describe('findOne', () => {
    const workflowId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return workflow by ID', async () => {
      const mockWorkflow = {
        id: workflowId,
        name: 'Welcome Workflow',
        triggerType: 'form_submission',
        isActive: true,
        actions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workflowsService.findOne.mockResolvedValue(mockWorkflow);

      const result = await controller.findOne(workflowId);

      expect(workflowsService.findOne).toHaveBeenCalledWith(workflowId);
      expect(result).toEqual(mockWorkflow);
    });

    it('should throw NotFoundException when workflow not found', async () => {
      workflowsService.findOne.mockRejectedValue(new NotFoundException('Workflow not found'));

      await expect(controller.findOne(workflowId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const workflowId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: Partial<CreateWorkflowDto> = {
      name: 'Updated Workflow Name',
    };

    it('should update workflow successfully', async () => {
      const mockWorkflow = {
        id: workflowId,
        name: 'Updated Workflow Name',
        triggerType: 'form_submission',
        isActive: true,
        updatedAt: new Date(),
      };

      workflowsService.update.mockResolvedValue(mockWorkflow);

      const result = await controller.update(workflowId, mockRequest, updateDto);

      expect(workflowsService.update).toHaveBeenCalledWith(
        workflowId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockWorkflow);
    });
  });

  describe('remove', () => {
    const workflowId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete workflow successfully', async () => {
      workflowsService.remove.mockResolvedValue({
        message: 'Workflow deleted successfully',
      });

      const result = await controller.remove(workflowId);

      expect(workflowsService.remove).toHaveBeenCalledWith(workflowId);
      expect(result).toEqual({ message: 'Workflow deleted successfully' });
    });
  });

  describe('execute', () => {
    const workflowId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const context = {
      contactId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      formId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    };

    it('should execute workflow successfully', async () => {
      const mockResult = {
        success: true,
        executedActions: 2,
        results: [],
      };

      workflowsService.execute.mockResolvedValue(mockResult);

      const result = await controller.execute(workflowId, context);

      expect(workflowsService.execute).toHaveBeenCalledWith(workflowId, context);
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException when workflow not found', async () => {
      workflowsService.execute.mockRejectedValue(new NotFoundException('Workflow not found'));

      await expect(controller.execute(workflowId, context)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when workflow execution fails', async () => {
      workflowsService.execute.mockRejectedValue(
        new BadRequestException('Workflow execution failed'),
      );

      await expect(controller.execute(workflowId, context)).rejects.toThrow(BadRequestException);
    });
  });
});

