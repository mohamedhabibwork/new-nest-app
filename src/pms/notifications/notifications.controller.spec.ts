import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockNotificationsService = {
    getUserNotifications: jest.fn(),
    getNotification: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should return paginated notifications', async () => {
      const queryDto: NotificationQueryDto = {
        page: 1,
        limit: 50,
      };

      const mockNotifications = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          userId: mockRequest.user.id,
          type: 'task_assigned',
          message: 'You have been assigned to a task',
          isRead: false,
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockNotifications,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      notificationsService.getUserNotifications.mockResolvedValue(mockResponse);

      const result = await controller.getUserNotifications(
        queryDto,
        mockRequest,
      );

      expect(notificationsService.getUserNotifications).toHaveBeenCalledWith(
        queryDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return filtered unread notifications', async () => {
      const queryDto: NotificationQueryDto = {
        page: 1,
        limit: 50,
        unreadOnly: true,
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

      notificationsService.getUserNotifications.mockResolvedValue(mockResponse);

      const result = await controller.getUserNotifications(
        queryDto,
        mockRequest,
      );

      expect(notificationsService.getUserNotifications).toHaveBeenCalledWith(
        queryDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return sorted notifications', async () => {
      const queryDto: NotificationQueryDto = {
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

      notificationsService.getUserNotifications.mockResolvedValue(mockResponse);

      const result = await controller.getUserNotifications(
        queryDto,
        mockRequest,
      );

      expect(notificationsService.getUserNotifications).toHaveBeenCalledWith(
        queryDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markAsRead', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const notificationId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should mark notification as read successfully', async () => {
      const mockNotification = {
        id: notificationId,
        userId: mockRequest.user.id,
        type: 'task_assigned',
        message: 'You have been assigned to a task',
        isRead: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      notificationsService.markAsRead.mockResolvedValue({ count: 1 });

      const result = await controller.markAsRead(notificationId, mockRequest);

      expect(notificationsService.markAsRead).toHaveBeenCalledWith(
        notificationId,
        mockRequest.user.id,
      );
      expect(result.count).toBe(1);
    });

    it('should return count 0 when notification not found', async () => {
      notificationsService.markAsRead.mockResolvedValue({ count: 0 });

      const result = await controller.markAsRead(notificationId, mockRequest);

      expect(notificationsService.markAsRead).toHaveBeenCalledWith(
        notificationId,
        mockRequest.user.id,
      );
      expect(result.count).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should mark all notifications as read successfully', async () => {
      notificationsService.markAllAsRead.mockResolvedValue({
        message: 'All notifications marked as read',
        count: 5,
      });

      const result = await controller.markAllAsRead(mockRequest);

      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
      expect(result).toEqual({
        message: 'All notifications marked as read',
        count: 5,
      });
    });
  });

  describe('delete', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const notificationId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete notification successfully', async () => {
      notificationsService.delete.mockResolvedValue({
        count: 1,
      });

      const result = await controller.delete(notificationId, mockRequest);

      expect(notificationsService.delete).toHaveBeenCalledWith(
        notificationId,
        mockRequest.user.id,
      );
      expect(result).toEqual({ count: 1 });
    });

    it('should return count 0 when notification not found', async () => {
      notificationsService.delete.mockResolvedValue({
        count: 0,
      });

      const result = await controller.delete(notificationId, mockRequest);

      expect(notificationsService.delete).toHaveBeenCalledWith(
        notificationId,
        mockRequest.user.id,
      );
      expect(result.count).toBe(0);
    });
  });
});
