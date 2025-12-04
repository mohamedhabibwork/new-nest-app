import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationsService } from '../pms/notifications/notifications.service';
import type {
  ListNotificationsRequest,
  ListNotificationsResponse,
  GetNotificationRequest,
  GetNotificationResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
  MarkAllAsReadRequest,
  MarkAllAsReadResponse,
  DeleteNotificationRequest,
  DeleteNotificationResponse,
} from './types';
import { mapNotificationToGrpc, toGrpcPaginationResponse } from './utils';

@Controller()
export class NotificationsGrpcController {
  constructor(private notificationsService: NotificationsService) {}

  @GrpcMethod('NotificationService', 'ListNotifications')
  async listNotifications(
    data: ListNotificationsRequest,
  ): Promise<ListNotificationsResponse> {
    const result = await this.notificationsService.getUserNotifications(
      {
        page: data.page || 1,
        limit: data.limit || 50,
        unreadOnly: data.unread_only || false,
        sortBy: 'createdAt',
        sortOrder: data.sort_order || 'desc',
      },
      data.user_id,
    );
    return {
      notifications: result.data.map(mapNotificationToGrpc),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }

  @GrpcMethod('NotificationService', 'GetNotification')
  async getNotification(
    data: GetNotificationRequest,
  ): Promise<GetNotificationResponse> {
    const result = await this.notificationsService.getUserNotifications(
      {
        page: 1,
        limit: 1000,
        unreadOnly: false,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      data.user_id,
    );
    const notification = result.data.find((n) => n.id === data.id);
    return {
      notification: notification
        ? mapNotificationToGrpc(notification)
        : undefined,
    };
  }

  @GrpcMethod('NotificationService', 'MarkAsRead')
  async markAsRead(data: MarkAsReadRequest): Promise<MarkAsReadResponse> {
    await this.notificationsService.markAsRead(data.id, data.user_id);
    return { message: 'Notification marked as read' };
  }

  @GrpcMethod('NotificationService', 'MarkAllAsRead')
  async markAllAsRead(
    data: MarkAllAsReadRequest,
  ): Promise<MarkAllAsReadResponse> {
    await this.notificationsService.markAllAsRead(data.user_id);
    return { message: 'All notifications marked as read' };
  }

  @GrpcMethod('NotificationService', 'DeleteNotification')
  async deleteNotification(
    data: DeleteNotificationRequest,
  ): Promise<DeleteNotificationResponse> {
    await this.notificationsService.delete(data.id, data.user_id);
    return { message: 'Notification deleted successfully' };
  }
}
