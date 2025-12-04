import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateTaskDependencyDto } from './dto/create-task-dependency.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { ReorderChecklistDto } from './dto/reorder-checklist.dto';
import { TaskQueryDto } from './dto/task-query.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: jest.Mocked<TasksService>;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getTaskAttachments: jest.fn(),
    assignUserToTask: jest.fn(),
    unassignUserFromTask: jest.fn(),
    getTaskAssignments: jest.fn(),
    updateAssignment: jest.fn(),
    addTaskDependency: jest.fn(),
    removeTaskDependency: jest.fn(),
    getTaskDependencies: jest.fn(),
    addChecklistItem: jest.fn(),
    updateChecklistItem: jest.fn(),
    deleteChecklistItem: jest.fn(),
    getChecklistItems: jest.fn(),
    reorderChecklistItems: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get(TasksService);
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

    const createDto: CreateTaskDto = {
      projectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      taskTitle: 'Test Task',
      description: 'Test Description',
      priority: 'high',
    };

    it('should create a task successfully', async () => {
      const mockTask = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        projectId: createDto.projectId,
        taskTitle: 'Test Task',
        description: 'Test Description',
        status: 'to_do',
        priority: 'high',
        createdBy: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(mockRequest, createDto);

      expect(tasksService.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when project not found', async () => {
      tasksService.create.mockRejectedValue(new NotFoundException('Project not found'));

      await expect(controller.create(mockRequest, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access to project', async () => {
      tasksService.create.mockRejectedValue(
        new ForbiddenException('You do not have access to this project'),
      );

      await expect(controller.create(mockRequest, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should return paginated tasks', async () => {
      const queryDto: TaskQueryDto = {
        page: 1,
        limit: 50,
        projectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      };

      const mockTasks = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          taskTitle: 'Task 1',
          projectId: queryDto.projectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockTasks,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      tasksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(tasksService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered tasks by status', async () => {
      const queryDto: TaskQueryDto = {
        page: 1,
        limit: 50,
        status: 'in_progress',
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

      tasksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(tasksService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered tasks by priority', async () => {
      const queryDto: TaskQueryDto = {
        page: 1,
        limit: 50,
        priority: 'high',
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

      tasksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(tasksService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered tasks by assignee', async () => {
      const queryDto: TaskQueryDto = {
        page: 1,
        limit: 50,
        assigneeId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
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

      tasksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(tasksService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered tasks by date range', async () => {
      const queryDto: TaskQueryDto = {
        page: 1,
        limit: 50,
        dueDateFrom: '2024-01-01',
        dueDateTo: '2024-12-31',
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

      tasksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(tasksService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered tasks with search', async () => {
      const queryDto: TaskQueryDto = {
        page: 1,
        limit: 50,
        search: 'Test',
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

      tasksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(tasksService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return sorted tasks', async () => {
      const queryDto: TaskQueryDto = {
        page: 1,
        limit: 50,
        sortBy: 'dueDate',
        sortOrder: 'asc',
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

      tasksService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(tasksService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return task by ID', async () => {
      const mockTask = {
        id: taskId,
        taskTitle: 'Test Task',
        projectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        description: 'Test Description',
        status: 'in_progress',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(taskId, mockRequest);

      expect(tasksService.findOne).toHaveBeenCalledWith(taskId, mockRequest.user.id);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      tasksService.findOne.mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.findOne(taskId, mockRequest)).rejects.toThrow(NotFoundException);
      expect(tasksService.findOne).toHaveBeenCalledWith(taskId, mockRequest.user.id);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      tasksService.findOne.mockRejectedValue(
        new ForbiddenException('No access to task'),
      );

      await expect(controller.findOne(taskId, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateTaskDto = {
      taskTitle: 'Updated Task',
      description: 'Updated Description',
      status: 'completed',
    };

    it('should update task successfully', async () => {
      const mockTask = {
        id: taskId,
        taskTitle: 'Updated Task',
        description: 'Updated Description',
        status: 'completed',
        projectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tasksService.update.mockResolvedValue(mockTask);

      const result = await controller.update(taskId, mockRequest, updateDto);

      expect(tasksService.update).toHaveBeenCalledWith(
        taskId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      tasksService.update.mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.update(taskId, mockRequest, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access', async () => {
      tasksService.update.mockRejectedValue(
        new ForbiddenException('No access to task'),
      );

      await expect(controller.update(taskId, mockRequest, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete task successfully', async () => {
      tasksService.remove.mockResolvedValue({
        message: 'Task deleted successfully',
      });

      const result = await controller.remove(taskId, mockRequest);

      expect(tasksService.remove).toHaveBeenCalledWith(taskId, mockRequest.user.id);
      expect(result).toEqual({ message: 'Task deleted successfully' });
    });

    it('should throw NotFoundException when task not found', async () => {
      tasksService.remove.mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.remove(taskId, mockRequest)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      tasksService.remove.mockRejectedValue(
        new ForbiddenException('No access to task'),
      );

      await expect(controller.remove(taskId, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getTaskAttachments', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return paginated task attachments', async () => {
      const mockAttachments = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          fileName: 'test.pdf',
          entityType: 'task',
          entityId: taskId,
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockAttachments,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      tasksService.getTaskAttachments.mockResolvedValue(mockResponse);

      const result = await controller.getTaskAttachments(taskId, mockRequest, 1, 50);

      expect(tasksService.getTaskAttachments).toHaveBeenCalledWith(
        taskId,
        mockRequest.user.id,
        1,
        50,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('assignUserToTask', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const assignDto: AssignTaskDto = {
      userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      isPrimary: false,
    };

    it('should assign user to task successfully', async () => {
      const mockAssignment = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        taskId,
        userId: assignDto.userId,
        isPrimary: false,
        assignedAt: new Date(),
      };

      tasksService.assignUserToTask.mockResolvedValue(mockAssignment);

      const result = await controller.assignUserToTask(taskId, mockRequest, assignDto);

      expect(tasksService.assignUserToTask).toHaveBeenCalledWith(
        taskId,
        assignDto.userId,
        mockRequest.user.id,
        assignDto.isPrimary || false,
      );
      expect(result).toEqual(mockAssignment);
    });

    it('should assign user as primary', async () => {
      const assignDtoPrimary: AssignTaskDto = {
        userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        isPrimary: true,
      };

      const mockAssignment = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        taskId,
        userId: assignDtoPrimary.userId,
        isPrimary: true,
        assignedAt: new Date(),
      };

      tasksService.assignUserToTask.mockResolvedValue(mockAssignment);

      const result = await controller.assignUserToTask(taskId, mockRequest, assignDtoPrimary);

      expect(tasksService.assignUserToTask).toHaveBeenCalledWith(
        taskId,
        assignDtoPrimary.userId,
        mockRequest.user.id,
        true,
      );
      expect(result.isPrimary).toBe(true);
    });

    it('should throw NotFoundException when task not found', async () => {
      tasksService.assignUserToTask.mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(
        controller.assignUserToTask(taskId, mockRequest, assignDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user already assigned', async () => {
      tasksService.assignUserToTask.mockRejectedValue(
        new BadRequestException('User already assigned to this task'),
      );

      await expect(
        controller.assignUserToTask(taskId, mockRequest, assignDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unassignUserFromTask', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const userId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should unassign user from task successfully', async () => {
      tasksService.unassignUserFromTask.mockResolvedValue({
        message: 'User unassigned from task successfully',
      });

      const result = await controller.unassignUserFromTask(taskId, userId, mockRequest);

      expect(tasksService.unassignUserFromTask).toHaveBeenCalledWith(
        taskId,
        userId,
        mockRequest.user.id,
      );
      expect(result).toEqual({ message: 'User unassigned from task successfully' });
    });

    it('should throw NotFoundException when assignment not found', async () => {
      tasksService.unassignUserFromTask.mockRejectedValue(
        new NotFoundException('Assignment not found'),
      );

      await expect(
        controller.unassignUserFromTask(taskId, userId, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTaskAssignments', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return paginated task assignments', async () => {
      const mockAssignments = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          taskId,
          userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          isPrimary: true,
          assignedAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockAssignments,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      tasksService.getTaskAssignments.mockResolvedValue(mockResponse);

      const result = await controller.getTaskAssignments(taskId, mockRequest, 1, 50);

      expect(tasksService.getTaskAssignments).toHaveBeenCalledWith(
        taskId,
        mockRequest.user.id,
        1,
        50,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateAssignment', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const assignmentId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should update assignment successfully', async () => {
      const mockAssignment = {
        id: assignmentId,
        taskId,
        userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        isPrimary: true,
        assignedAt: new Date(),
      };

      tasksService.updateAssignment.mockResolvedValue(mockAssignment);

      const result = await controller.updateAssignment(
        taskId,
        assignmentId,
        mockRequest,
        { isPrimary: true },
      );

      expect(tasksService.updateAssignment).toHaveBeenCalledWith(
        taskId,
        assignmentId,
        mockRequest.user.id,
        true,
      );
      expect(result).toEqual(mockAssignment);
    });

    it('should throw NotFoundException when assignment not found', async () => {
      tasksService.updateAssignment.mockRejectedValue(
        new NotFoundException('Assignment not found'),
      );

      await expect(
        controller.updateAssignment(taskId, assignmentId, mockRequest, { isPrimary: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addTaskDependency', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const createDto: CreateTaskDependencyDto = {
      dependsOnTaskId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      dependencyType: 'blocked_by',
    };

    it('should add task dependency successfully', async () => {
      const mockDependency = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        taskId,
        dependsOnTaskId: createDto.dependsOnTaskId,
        dependencyType: 'blocked_by',
        createdAt: new Date(),
      };

      tasksService.addTaskDependency.mockResolvedValue(mockDependency);

      const result = await controller.addTaskDependency(taskId, mockRequest, createDto);

      expect(tasksService.addTaskDependency).toHaveBeenCalledWith(
        taskId,
        createDto.dependsOnTaskId,
        createDto.dependencyType,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockDependency);
    });

    it('should throw NotFoundException when task not found', async () => {
      tasksService.addTaskDependency.mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(
        controller.addTaskDependency(taskId, mockRequest, createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for circular dependency', async () => {
      tasksService.addTaskDependency.mockRejectedValue(
        new ForbiddenException('Circular dependency detected'),
      );

      await expect(
        controller.addTaskDependency(taskId, mockRequest, createDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeTaskDependency', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const dependencyId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should remove task dependency successfully', async () => {
      tasksService.removeTaskDependency.mockResolvedValue({
        message: 'Dependency removed successfully',
      });

      const result = await controller.removeTaskDependency(
        taskId,
        dependencyId,
        mockRequest,
      );

      expect(tasksService.removeTaskDependency).toHaveBeenCalledWith(
        taskId,
        dependencyId,
        mockRequest.user.id,
      );
      expect(result).toEqual({ message: 'Dependency removed successfully' });
    });

    it('should throw NotFoundException when dependency not found', async () => {
      tasksService.removeTaskDependency.mockRejectedValue(
        new NotFoundException('Dependency not found'),
      );

      await expect(
        controller.removeTaskDependency(taskId, dependencyId, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTaskDependencies', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return paginated task dependencies', async () => {
      const mockDependencies = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          taskId,
          dependsOnTaskId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          dependencyType: 'blocked_by',
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockDependencies,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      tasksService.getTaskDependencies.mockResolvedValue(mockResponse);

      const result = await controller.getTaskDependencies(taskId, mockRequest, 1, 50);

      expect(tasksService.getTaskDependencies).toHaveBeenCalledWith(
        taskId,
        mockRequest.user.id,
        1,
        50,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addChecklistItem', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const createDto: CreateChecklistItemDto = {
      itemText: 'Review design mockups',
      orderIndex: 0,
    };

    it('should add checklist item successfully', async () => {
      const mockItem = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        taskId,
        itemText: 'Review design mockups',
        isCompleted: false,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tasksService.addChecklistItem.mockResolvedValue(mockItem);

      const result = await controller.addChecklistItem(taskId, mockRequest, createDto);

      expect(tasksService.addChecklistItem).toHaveBeenCalledWith(
        taskId,
        mockRequest.user.id,
        createDto.itemText,
        createDto.orderIndex,
      );
      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundException when task not found', async () => {
      tasksService.addChecklistItem.mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(
        controller.addChecklistItem(taskId, mockRequest, createDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateChecklistItem', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const itemId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateChecklistItemDto = {
      itemText: 'Updated item text',
      isCompleted: true,
    };

    it('should update checklist item successfully', async () => {
      const mockItem = {
        id: itemId,
        taskId,
        itemText: 'Updated item text',
        isCompleted: true,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      tasksService.updateChecklistItem.mockResolvedValue(mockItem);

      const result = await controller.updateChecklistItem(
        taskId,
        itemId,
        mockRequest,
        updateDto,
      );

      expect(tasksService.updateChecklistItem).toHaveBeenCalledWith(
        taskId,
        itemId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundException when checklist item not found', async () => {
      tasksService.updateChecklistItem.mockRejectedValue(
        new NotFoundException('Checklist item not found'),
      );

      await expect(
        controller.updateChecklistItem(taskId, itemId, mockRequest, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteChecklistItem', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const itemId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete checklist item successfully', async () => {
      tasksService.deleteChecklistItem.mockResolvedValue({
        message: 'Checklist item deleted successfully',
      });

      const result = await controller.deleteChecklistItem(taskId, itemId, mockRequest);

      expect(tasksService.deleteChecklistItem).toHaveBeenCalledWith(
        taskId,
        itemId,
        mockRequest.user.id,
      );
      expect(result).toEqual({ message: 'Checklist item deleted successfully' });
    });

    it('should throw NotFoundException when checklist item not found', async () => {
      tasksService.deleteChecklistItem.mockRejectedValue(
        new NotFoundException('Checklist item not found'),
      );

      await expect(
        controller.deleteChecklistItem(taskId, itemId, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getChecklistItems', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return paginated checklist items', async () => {
      const mockItems = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          taskId,
          itemText: 'Review design mockups',
          isCompleted: false,
          orderIndex: 0,
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockItems,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      tasksService.getChecklistItems.mockResolvedValue(mockResponse);

      const result = await controller.getChecklistItems(taskId, mockRequest, 1, 50);

      expect(tasksService.getChecklistItems).toHaveBeenCalledWith(
        taskId,
        mockRequest.user.id,
        1,
        50,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('reorderChecklistItems', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const reorderDto: ReorderChecklistDto = {
      itemIds: ['01ARZ3NDEKTSV4RRFFQ69G5FAV', '01ARZ3NDEKTSV4RRFFQ69G5FAV'],
    };

    it('should reorder checklist items successfully', async () => {
      tasksService.reorderChecklistItems.mockResolvedValue({
        message: 'Checklist items reordered successfully',
      });

      const result = await controller.reorderChecklistItems(taskId, mockRequest, reorderDto);

      expect(tasksService.reorderChecklistItems).toHaveBeenCalledWith(
        taskId,
        mockRequest.user.id,
        reorderDto.itemIds,
      );
      expect(result).toEqual({ message: 'Checklist items reordered successfully' });
    });

    it('should throw ForbiddenException when items do not belong to task', async () => {
      tasksService.reorderChecklistItems.mockRejectedValue(
        new ForbiddenException('Some items do not belong to this task'),
      );

      await expect(
        controller.reorderChecklistItems(taskId, mockRequest, reorderDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

