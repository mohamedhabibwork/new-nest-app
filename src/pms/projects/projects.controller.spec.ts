import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: jest.Mocked<ProjectsService>;

  const mockProjectsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get(ProjectsService);
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

    const createDto: CreateProjectDto = {
      workspaceId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      projectName: 'Test Project',
      description: 'Test Description',
      priority: 'medium',
    };

    it('should create a project successfully', async () => {
      const mockProject = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        workspaceId: createDto.workspaceId,
        projectName: 'Test Project',
        description: 'Test Description',
        status: 'planning',
        priority: 'medium',
        projectManagerId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      projectsService.create.mockResolvedValue(mockProject);

      const result = await controller.create(mockRequest, createDto);

      expect(projectsService.create).toHaveBeenCalledWith(
        mockRequest.user.id,
        createDto,
      );
      expect(result).toEqual(mockProject);
    });
  });

  describe('findAll', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should return paginated projects', async () => {
      const queryDto: ProjectQueryDto = {
        page: 1,
        limit: 50,
        workspaceId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      };

      const mockProjects = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          projectName: 'Project 1',
          workspaceId: queryDto.workspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockProjects,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      projectsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(projectsService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered projects by status', async () => {
      const queryDto: ProjectQueryDto = {
        page: 1,
        limit: 50,
        workspaceId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        status: 'active',
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

      projectsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(projectsService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered projects with search', async () => {
      const queryDto: ProjectQueryDto = {
        page: 1,
        limit: 50,
        workspaceId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
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

      projectsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(projectsService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return sorted projects', async () => {
      const queryDto: ProjectQueryDto = {
        page: 1,
        limit: 50,
        workspaceId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        sortBy: 'projectName',
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

      projectsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(projectsService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const projectId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return project by ID', async () => {
      const mockProject = {
        id: projectId,
        projectName: 'Test Project',
        workspaceId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        description: 'Test Description',
        status: 'active',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      projectsService.findOne.mockResolvedValue(mockProject);

      const result = await controller.findOne(projectId, mockRequest);

      expect(projectsService.findOne).toHaveBeenCalledWith(projectId, mockRequest.user.id);
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectsService.findOne.mockRejectedValue(new NotFoundException('Project not found'));

      await expect(controller.findOne(projectId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(projectsService.findOne).toHaveBeenCalledWith(projectId, mockRequest.user.id);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      projectsService.findOne.mockRejectedValue(
        new ForbiddenException('No access to project'),
      );

      await expect(controller.findOne(projectId, mockRequest)).rejects.toThrow(
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

    const projectId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateProjectDto = {
      projectName: 'Updated Project',
      description: 'Updated Description',
      status: 'active',
    };

    it('should update project successfully', async () => {
      const mockProject = {
        id: projectId,
        projectName: 'Updated Project',
        description: 'Updated Description',
        status: 'active',
        workspaceId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      projectsService.update.mockResolvedValue(mockProject);

      const result = await controller.update(projectId, mockRequest, updateDto);

      expect(projectsService.update).toHaveBeenCalledWith(
        projectId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectsService.update.mockRejectedValue(new NotFoundException('Project not found'));

      await expect(controller.update(projectId, mockRequest, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access', async () => {
      projectsService.update.mockRejectedValue(
        new ForbiddenException('No access to project'),
      );

      await expect(controller.update(projectId, mockRequest, updateDto)).rejects.toThrow(
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

    const projectId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete project successfully', async () => {
      projectsService.remove.mockResolvedValue({
        message: 'Project deleted successfully',
      });

      const result = await controller.remove(projectId, mockRequest);

      expect(projectsService.remove).toHaveBeenCalledWith(projectId, mockRequest.user.id);
      expect(result).toEqual({ message: 'Project deleted successfully' });
    });

    it('should throw NotFoundException when project not found', async () => {
      projectsService.remove.mockRejectedValue(new NotFoundException('Project not found'));

      await expect(controller.remove(projectId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access', async () => {
      projectsService.remove.mockRejectedValue(
        new ForbiddenException('No access to project'),
      );

      await expect(controller.remove(projectId, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

