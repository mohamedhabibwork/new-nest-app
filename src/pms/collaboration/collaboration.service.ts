import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { WebSocketEventsService } from '../../websocket/websocket-events.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import { buildPaginationResponse, normalizePaginationParams } from '../../common/utils/pagination.util';
import { CommentQueryDto } from './dto/comment-query.dto';
import { TimeLogQueryDto } from './dto/time-log-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CollaborationService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
    private wsEvents: WebSocketEventsService,
  ) {}

  // Comments
  async createComment(
    userId: string,
    data: { taskId: string; commentText: string; parentCommentId?: string },
  ) {
    // Verify task access
    const task = await this.verifyTaskAccess(data.taskId, userId);

    const comment = await this.prisma.comment.create({
      data: withUlid({
        taskId: data.taskId,
        userId,
        commentText: data.commentText,
        parentCommentId: data.parentCommentId,
      }),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify task assignees and project members about new comment
    const assigneeIds = task.taskAssignments?.map((ta) => ta.userId) || [];
    const projectMembers = task.project.projectMembers.map((pm) => pm.userId);
    const notifyUserIds = [...new Set([...assigneeIds, ...projectMembers])];

    if (notifyUserIds.length > 0) {
      await this.notificationEvents.notifyCommentAdded(
        data.taskId,
        comment.id,
        userId,
        data.commentText,
        notifyUserIds,
      );
    }

    // Emit WebSocket event
    this.wsEvents.emitCommentAdded(data.taskId, task.projectId, comment);

    return comment;
  }

  async getTaskComments(queryDto: CommentQueryDto, taskId: string, userId: string) {
    await this.verifyTaskAccess(taskId, userId);

    const { page, limit } = normalizePaginationParams(queryDto.page, queryDto.limit);

    // Build orderBy
    const orderBy: Prisma.CommentOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'asc';

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'createdAt';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { taskId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: { taskId },
      }),
    ]);

    return buildPaginationResponse(comments, total, page, limit);
  }

  async updateComment(commentId: string, userId: string, data: { commentText: string }) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const task = await this.verifyTaskAccess(comment.taskId, userId);

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { commentText: data.commentText },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Emit WebSocket event
    this.wsEvents.emitCommentUpdated(comment.taskId, task.projectId, commentId, updatedComment);

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.verifyTaskAccess(comment.taskId, userId);

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  // Time Logs
  async createTimeLog(
    userId: string,
    data: {
      taskId: string;
      hoursLogged: number;
      logDate: Date;
      description?: string;
      isBillable?: boolean;
    },
  ) {
    const task = await this.verifyTaskAccess(data.taskId, userId);

    const timeLog = await this.prisma.timeLog.create({
      data: withUlid({
        taskId: data.taskId,
        userId,
        hoursLogged: data.hoursLogged,
        logDate: data.logDate,
        description: data.description,
        isBillable: data.isBillable || false,
      }),
    });

    // Notify task assignees and project members about time logged
    const assigneeIds = task.taskAssignments?.map((ta) => ta.userId) || [];
    const projectMembers = task.project.projectMembers.map((pm) => pm.userId);
    const notifyUserIds = [...new Set([...assigneeIds, ...projectMembers])];

    if (notifyUserIds.length > 0) {
      await this.notificationEvents.notifyTimeLogged(
        timeLog.id,
        data.taskId,
        userId,
        data.hoursLogged,
        notifyUserIds,
      );
    }

    // Emit WebSocket event
    this.wsEvents.emitTimeLogged(data.taskId, task.projectId, timeLog);

    return timeLog;
  }

  async getTaskTimeLogs(queryDto: TimeLogQueryDto, taskId: string, userId: string) {
    await this.verifyTaskAccess(taskId, userId);

    const { page, limit } = normalizePaginationParams(queryDto.page, queryDto.limit);

    // Build where clause
    const where: Prisma.TimeLogWhereInput = {
      taskId,
    };

    // Apply filters
    if (queryDto.userId) {
      where.userId = queryDto.userId;
    }

    if (queryDto.logDateFrom || queryDto.logDateTo) {
      where.logDate = {};
      if (queryDto.logDateFrom) {
        where.logDate.gte = new Date(queryDto.logDateFrom);
      }
      if (queryDto.logDateTo) {
        where.logDate.lte = new Date(queryDto.logDateTo);
      }
    }

    // Build orderBy
    const orderBy: Prisma.TimeLogOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'logDate';
    const sortOrder = queryDto.sortOrder || 'desc';

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      logDate: 'logDate',
      hoursLogged: 'hoursLogged',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'logDate';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    const [timeLogs, total] = await Promise.all([
      this.prisma.timeLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.timeLog.count({ where }),
    ]);

    return buildPaginationResponse(timeLogs, total, page, limit);
  }

  // Attachments - Now using unified file system
  async getTaskAttachments(taskId: string, userId: string) {
    await this.verifyTaskAccess(taskId, userId);

    return this.prisma.attachment.findMany({
      where: {
        entityType: 'task',
        entityId: taskId,
      },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  private async verifyTaskAccess(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            workspace: true,
            projectMembers: true,
          },
        },
        taskAssignments: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isWorkspaceOwner = task.project.workspace.ownerId === userId;
    const isProjectMember = task.project.projectMembers.some(
      (pm) => pm.userId === userId,
    );

    if (!isWorkspaceOwner && !isProjectMember) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }
}

