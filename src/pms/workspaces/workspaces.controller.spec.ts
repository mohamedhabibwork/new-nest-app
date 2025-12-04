import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceInvitationService } from './services/workspace-invitation.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteUserDto, WorkspaceRole } from './dto/invite-user.dto';
import { WorkspaceQueryDto } from './dto/workspace-query.dto';

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let workspacesService: jest.Mocked<WorkspacesService>;
  let invitationService: jest.Mocked<WorkspaceInvitationService>;

  const mockWorkspacesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockInvitationService = {
    inviteUserToWorkspace: jest.fn(),
    getWorkspaceInvitations: jest.fn(),
    acceptInvitation: jest.fn(),
    cancelInvitation: jest.fn(),
    resendInvitation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: mockWorkspacesService,
        },
        {
          provide: WorkspaceInvitationService,
          useValue: mockInvitationService,
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    workspacesService = module.get(WorkspacesService);
    invitationService = module.get(WorkspaceInvitationService);
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

    const createDto: CreateWorkspaceDto = {
      workspaceName: 'Test Workspace',
      description: 'Test Description',
    };

    it('should create a workspace successfully', async () => {
      const mockWorkspace = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        workspaceName: 'Test Workspace',
        description: 'Test Description',
        ownerId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workspacesService.create.mockResolvedValue(mockWorkspace);

      const result = await controller.create(mockRequest, createDto);

      expect(workspacesService.create).toHaveBeenCalledWith(
        mockRequest.user.id,
        createDto,
      );
      expect(result).toEqual(mockWorkspace);
    });

    it('should create workspace without description', async () => {
      const createDtoWithoutDesc: CreateWorkspaceDto = {
        workspaceName: 'Test Workspace',
      };

      const mockWorkspace = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        workspaceName: 'Test Workspace',
        description: null,
        ownerId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workspacesService.create.mockResolvedValue(mockWorkspace);

      const result = await controller.create(mockRequest, createDtoWithoutDesc);

      expect(workspacesService.create).toHaveBeenCalledWith(
        mockRequest.user.id,
        createDtoWithoutDesc,
      );
      expect(result).toEqual(mockWorkspace);
    });
  });

  describe('findAll', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should return paginated workspaces', async () => {
      const queryDto: WorkspaceQueryDto = {
        page: 1,
        limit: 50,
      };

      const mockWorkspaces = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          workspaceName: 'Workspace 1',
          ownerId: mockRequest.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockWorkspaces,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      workspacesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(workspacesService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered workspaces with search', async () => {
      const queryDto: WorkspaceQueryDto = {
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

      workspacesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(workspacesService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });

    it('should return sorted workspaces', async () => {
      const queryDto: WorkspaceQueryDto = {
        page: 1,
        limit: 50,
        sortBy: 'workspaceName',
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

      workspacesService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(workspacesService.findAll).toHaveBeenCalledWith(queryDto, mockRequest.user.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const workspaceId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return workspace by ID', async () => {
      const mockWorkspace = {
        id: workspaceId,
        workspaceName: 'Test Workspace',
        description: 'Test Description',
        ownerId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workspacesService.findOne.mockResolvedValue(mockWorkspace);

      const result = await controller.findOne(workspaceId, mockRequest);

      expect(workspacesService.findOne).toHaveBeenCalledWith(workspaceId, mockRequest.user.id);
      expect(result).toEqual(mockWorkspace);
    });

    it('should throw NotFoundException when workspace not found', async () => {
      workspacesService.findOne.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(controller.findOne(workspaceId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(workspacesService.findOne).toHaveBeenCalledWith(workspaceId, mockRequest.user.id);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      workspacesService.findOne.mockRejectedValue(
        new ForbiddenException('No access to workspace'),
      );

      await expect(controller.findOne(workspaceId, mockRequest)).rejects.toThrow(
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

    const workspaceId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto: UpdateWorkspaceDto = {
      workspaceName: 'Updated Workspace',
      description: 'Updated Description',
    };

    it('should update workspace successfully', async () => {
      const mockWorkspace = {
        id: workspaceId,
        workspaceName: 'Updated Workspace',
        description: 'Updated Description',
        ownerId: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workspacesService.update.mockResolvedValue(mockWorkspace);

      const result = await controller.update(workspaceId, mockRequest, updateDto);

      expect(workspacesService.update).toHaveBeenCalledWith(
        workspaceId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockWorkspace);
    });

    it('should throw NotFoundException when workspace not found', async () => {
      workspacesService.update.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(controller.update(workspaceId, mockRequest, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access', async () => {
      workspacesService.update.mockRejectedValue(
        new ForbiddenException('No access to workspace'),
      );

      await expect(controller.update(workspaceId, mockRequest, updateDto)).rejects.toThrow(
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

    const workspaceId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete workspace successfully', async () => {
      workspacesService.remove.mockResolvedValue({
        message: 'Workspace deleted successfully',
      });

      const result = await controller.remove(workspaceId, mockRequest);

      expect(workspacesService.remove).toHaveBeenCalledWith(workspaceId, mockRequest.user.id);
      expect(result).toEqual({ message: 'Workspace deleted successfully' });
    });

    it('should throw NotFoundException when workspace not found', async () => {
      workspacesService.remove.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(controller.remove(workspaceId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access', async () => {
      workspacesService.remove.mockRejectedValue(
        new ForbiddenException('No access to workspace'),
      );

      await expect(controller.remove(workspaceId, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('inviteUser', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const workspaceId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const inviteUserDto: InviteUserDto = {
      email: 'invitee@example.com',
      role: WorkspaceRole.TEAM_MEMBER,
    };

    it('should invite user to workspace successfully', async () => {
      const mockInvitation = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        workspaceId,
        email: 'invitee@example.com',
        role: WorkspaceRole.TEAM_MEMBER,
        status: 'pending',
        invitationToken: 'token-here',
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      invitationService.inviteUserToWorkspace.mockResolvedValue(mockInvitation);

      const result = await controller.inviteUser(workspaceId, inviteUserDto, mockRequest);

      expect(invitationService.inviteUserToWorkspace).toHaveBeenCalledWith(
        workspaceId,
        inviteUserDto.email,
        inviteUserDto.role,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockInvitation);
    });

    it('should throw NotFoundException when workspace not found', async () => {
      invitationService.inviteUserToWorkspace.mockRejectedValue(
        new NotFoundException('Workspace not found'),
      );

      await expect(
        controller.inviteUser(workspaceId, inviteUserDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when invitation already exists', async () => {
      invitationService.inviteUserToWorkspace.mockRejectedValue(
        new BadRequestException('Invitation already sent to this email'),
      );

      await expect(
        controller.inviteUser(workspaceId, inviteUserDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getInvitations', () => {
    const workspaceId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return workspace invitations', async () => {
      const mockInvitations = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          workspaceId,
          email: 'invitee@example.com',
          role: WorkspaceRole.TEAM_MEMBER,
          status: 'pending',
          createdAt: new Date(),
        },
      ];

      invitationService.getWorkspaceInvitations.mockResolvedValue(mockInvitations);

      const result = await controller.getInvitations(workspaceId);

      expect(invitationService.getWorkspaceInvitations).toHaveBeenCalledWith(workspaceId);
      expect(result).toEqual(mockInvitations);
    });
  });

  describe('acceptInvitation', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const token = 'invitation-token-here';

    it('should accept invitation successfully', async () => {
      invitationService.acceptInvitation.mockResolvedValue({
        message: 'Invitation accepted successfully',
      });

      const result = await controller.acceptInvitation(token, mockRequest);

      expect(invitationService.acceptInvitation).toHaveBeenCalledWith(
        token,
        mockRequest.user.id,
      );
      expect(result).toEqual({ message: 'Invitation accepted successfully' });
    });

    it('should throw NotFoundException when invitation not found', async () => {
      invitationService.acceptInvitation.mockRejectedValue(
        new NotFoundException('Invitation not found'),
      );

      await expect(controller.acceptInvitation(token, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelInvitation', () => {
    const invitationId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should cancel invitation successfully', async () => {
      invitationService.cancelInvitation.mockResolvedValue(undefined);

      const result = await controller.cancelInvitation(invitationId);

      expect(invitationService.cancelInvitation).toHaveBeenCalledWith(invitationId);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when invitation not found', async () => {
      invitationService.cancelInvitation.mockRejectedValue(
        new NotFoundException('Invitation not found'),
      );

      await expect(controller.cancelInvitation(invitationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resendInvitation', () => {
    const invitationId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should resend invitation successfully', async () => {
      invitationService.resendInvitation.mockResolvedValue({
        message: 'Invitation email resent successfully',
      });

      const result = await controller.resendInvitation(invitationId);

      expect(invitationService.resendInvitation).toHaveBeenCalledWith(invitationId);
      expect(result).toEqual({ message: 'Invitation email resent successfully' });
    });

    it('should throw NotFoundException when invitation not found', async () => {
      invitationService.resendInvitation.mockRejectedValue(
        new NotFoundException('Invitation not found'),
      );

      await expect(controller.resendInvitation(invitationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

