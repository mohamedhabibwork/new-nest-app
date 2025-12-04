import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WebSocketEventsService } from '../../websocket/websocket-events.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import {
  buildPaginationResponse,
  normalizePaginationParams,
} from '../../common/utils/pagination.util';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private wsEvents: WebSocketEventsService,
  ) {}

  async create(
    userId: string,
    data: {
      notificationType: string;
      message: string;
      entityType?: string;
      entityId?: string;
    },
  ) {
    const notification = await this.prisma.notification.create({
      data: withUlid({
        userId,
        notificationType: data.notificationType,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
      }),
    });

    // Emit WebSocket event
    this.wsEvents.emitNotificationCreated(userId, notification);

    return notification;
  }

  async getUserNotifications(queryDto: NotificationQueryDto, userId: string) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );

    // Build where clause
    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    // Apply filters
    if (queryDto.unreadOnly) {
      where.isRead = false;
    }

    // Build orderBy
    const orderBy: Prisma.NotificationOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    orderBy[sortBy] = sortOrder;

    const skip = (page - 1) * limit;

    // Execute query
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return buildPaginationResponse(notifications, total, page, limit);
  }

  async markAsRead(notificationId: string, userId: string) {
    return await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async delete(notificationId: string, userId: string) {
    return await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }
}
