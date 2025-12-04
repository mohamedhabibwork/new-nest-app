import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CollaborationController } from './collaboration.controller';
import { CollaborationService } from './collaboration.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { TimeLogQueryDto } from './dto/time-log-query.dto';

describe('CollaborationController', () => {
  let controller: CollaborationController;
  let collaborationService: jest.Mocked<CollaborationService>;

  const mockCollaborationService = {
    createComment: jest.fn(),
    getTaskComments: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    createTimeLog: jest.fn(),
    getTaskTimeLogs: jest.fn(),
    getTaskAttachments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaborationController],
      providers: [
        {
          provide: CollaborationService,
          useValue: mockCollaborationService,
        },
      ],
    }).compile();

    controller = module.get<CollaborationController>(CollaborationController);
    collaborationService = module.get(CollaborationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const createDto: CreateCommentDto = {
      taskId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      commentText: 'This is a test comment',
    };

    it('should create a comment successfully', async () => {
      const mockComment = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        taskId: createDto.taskId,
        userId: mockRequest.user.id,
        commentText: 'This is a test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      collaborationService.createComment.mockResolvedValue(mockComment);

      const result = await controller.createComment(mockRequest, createDto);

      expect(collaborationService.createComment).toHaveBeenCalledWith(
        mockRequest.user.id,
        createDto,
      );
      expect(result).toEqual(mockComment);
    });

    it('should create a nested comment with parentCommentId', async () => {
      const createDtoWithParent: CreateCommentDto = {
        taskId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        commentText: 'This is a reply',
        parentCommentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      };

      const mockComment = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        taskId: createDtoWithParent.taskId,
        userId: mockRequest.user.id,
        commentText: 'This is a reply',
        parentCommentId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      collaborationService.createComment.mockResolvedValue(mockComment);

      const result = await controller.createComment(mockRequest, createDtoWithParent);

      expect(collaborationService.createComment).toHaveBeenCalledWith(
        mockRequest.user.id,
        createDtoWithParent,
      );
      expect(result.parentCommentId).toBeDefined();
    });

    it('should throw NotFoundException when task not found', async () => {
      collaborationService.createComment.mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(controller.createComment(mockRequest, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access to task', async () => {
      collaborationService.createComment.mockRejectedValue(
        new ForbiddenException('No access to task'),
      );

      await expect(controller.createComment(mockRequest, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getTaskComments', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return paginated comments', async () => {
      const queryDto: CommentQueryDto = {
        page: 1,
        limit: 50,
      };

      const mockComments = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          taskId,
          userId: mockRequest.user.id,
          commentText: 'Test comment',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockComments,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      collaborationService.getTaskComments.mockResolvedValue(mockResponse);

      const result = await controller.getTaskComments(taskId, queryDto, mockRequest);

      expect(collaborationService.getTaskComments).toHaveBeenCalledWith(
        queryDto,
        taskId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return sorted comments', async () => {
      const queryDto: CommentQueryDto = {
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
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

      collaborationService.getTaskComments.mockResolvedValue(mockResponse);

      const result = await controller.getTaskComments(taskId, queryDto, mockRequest);

      expect(collaborationService.getTaskComments).toHaveBeenCalledWith(
        queryDto,
        taskId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateComment', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const commentId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const updateDto = {
      commentText: 'Updated comment text',
    };

    it('should update comment successfully', async () => {
      const mockComment = {
        id: commentId,
        taskId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        userId: mockRequest.user.id,
        commentText: 'Updated comment text',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      collaborationService.updateComment.mockResolvedValue(mockComment);

      const result = await controller.updateComment(commentId, mockRequest, updateDto);

      expect(collaborationService.updateComment).toHaveBeenCalledWith(
        commentId,
        mockRequest.user.id,
        updateDto,
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when comment not found', async () => {
      collaborationService.updateComment.mockRejectedValue(
        new NotFoundException('Comment not found'),
      );

      await expect(
        controller.updateComment(commentId, mockRequest, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      collaborationService.updateComment.mockRejectedValue(
        new ForbiddenException('You can only update your own comments'),
      );

      await expect(
        controller.updateComment(commentId, mockRequest, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteComment', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const commentId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete comment successfully', async () => {
      collaborationService.deleteComment.mockResolvedValue({
        id: commentId,
      });

      const result = await controller.deleteComment(commentId, mockRequest);

      expect(collaborationService.deleteComment).toHaveBeenCalledWith(
        commentId,
        mockRequest.user.id,
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when comment not found', async () => {
      collaborationService.deleteComment.mockRejectedValue(
        new NotFoundException('Comment not found'),
      );

      await expect(controller.deleteComment(commentId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTimeLog', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const createDto: CreateTimeLogDto = {
      taskId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      hoursLogged: 8,
      logDate: new Date(),
      description: 'Worked on task implementation',
      isBillable: true,
    };

    it('should create a time log successfully', async () => {
      const mockTimeLog = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        taskId: createDto.taskId,
        userId: mockRequest.user.id,
        hoursLogged: 8,
        logDate: new Date(),
        description: 'Worked on task implementation',
        isBillable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      collaborationService.createTimeLog.mockResolvedValue(mockTimeLog);

      const result = await controller.createTimeLog(mockRequest, createDto);

      expect(collaborationService.createTimeLog).toHaveBeenCalledWith(
        mockRequest.user.id,
        createDto,
      );
      expect(result).toEqual(mockTimeLog);
    });

    it('should throw NotFoundException when task not found', async () => {
      collaborationService.createTimeLog.mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await expect(controller.createTimeLog(mockRequest, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access to task', async () => {
      collaborationService.createTimeLog.mockRejectedValue(
        new ForbiddenException('No access to task'),
      );

      await expect(controller.createTimeLog(mockRequest, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getTaskTimeLogs', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const taskId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return paginated time logs', async () => {
      const queryDto: TimeLogQueryDto = {
        page: 1,
        limit: 50,
      };

      const mockTimeLogs = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          taskId,
          userId: mockRequest.user.id,
          hoursLogged: 8,
          logDate: new Date(),
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockTimeLogs,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      collaborationService.getTaskTimeLogs.mockResolvedValue(mockResponse);

      const result = await controller.getTaskTimeLogs(taskId, queryDto, mockRequest);

      expect(collaborationService.getTaskTimeLogs).toHaveBeenCalledWith(
        queryDto,
        taskId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered time logs by userId', async () => {
      const queryDto: TimeLogQueryDto = {
        page: 1,
        limit: 50,
        userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
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

      collaborationService.getTaskTimeLogs.mockResolvedValue(mockResponse);

      const result = await controller.getTaskTimeLogs(taskId, queryDto, mockRequest);

      expect(collaborationService.getTaskTimeLogs).toHaveBeenCalledWith(
        queryDto,
        taskId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered time logs by date range', async () => {
      const queryDto: TimeLogQueryDto = {
        page: 1,
        limit: 50,
        logDateFrom: '2024-01-01',
        logDateTo: '2024-12-31',
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

      collaborationService.getTaskTimeLogs.mockResolvedValue(mockResponse);

      const result = await controller.getTaskTimeLogs(taskId, queryDto, mockRequest);

      expect(collaborationService.getTaskTimeLogs).toHaveBeenCalledWith(
        queryDto,
        taskId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return sorted time logs', async () => {
      const queryDto: TimeLogQueryDto = {
        page: 1,
        limit: 50,
        sortBy: 'logDate',
        sortOrder: 'desc',
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

      collaborationService.getTaskTimeLogs.mockResolvedValue(mockResponse);

      const result = await controller.getTaskTimeLogs(taskId, queryDto, mockRequest);

      expect(collaborationService.getTaskTimeLogs).toHaveBeenCalledWith(
        queryDto,
        taskId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });
  });

});

