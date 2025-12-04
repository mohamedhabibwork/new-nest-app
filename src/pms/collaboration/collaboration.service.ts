import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { WebSocketEventsService } from '../../websocket/websocket-events.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import {
  buildPaginationResponse,
  normalizePaginationParams,
} from '../../common/utils/pagination.util';
import { CommentQueryDto } from './dto/comment-query.dto';
import { TimeLogQueryDto } from './dto/time-log-query.dto';
import { Prisma } from '@prisma/client';
import {
  TaskWithProject,
  ProjectWithMembers,
  MentionWithUser,
  CommentableEntity,
} from '../../common/types/polymorphic.types';
import { hasProject, hasProjectMembers } from './types/entity-access.types';

@Injectable()
export class CollaborationService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
    private wsEvents: WebSocketEventsService,
  ) {}

  /**
   * Verify that the commentable entity exists and user has access
   */
  private async verifyCommentableAccess(
    commentableType: string,
    commentableId: string,
    userId: string,
  ): Promise<CommentableEntity> {
    let entity;
    if (commentableType === 'task') {
      entity = await this.prisma.task.findUnique({
        where: { id: commentableId },
        include: {
          project: {
            include: {
              workspace: true,
              projectMembers: true,
            },
          },
        },
      });
      if (!entity) {
        throw new NotFoundException('Task not found');
      }
      const taskEntity = entity as TaskWithProject;
      const isWorkspaceOwner = taskEntity.project.workspace.ownerId === userId;
      const isProjectMember = taskEntity.project.projectMembers.some(
        (pm) => pm.userId === userId,
      );
      if (!isWorkspaceOwner && !isProjectMember) {
        throw new ForbiddenException('You do not have access to this task');
      }
    } else if (commentableType === 'project') {
      entity = await this.prisma.project.findUnique({
        where: { id: commentableId },
        include: {
          workspace: true,
          projectMembers: true,
        },
      });
      if (!entity) {
        throw new NotFoundException('Project not found');
      }
      const projectEntity = entity as ProjectWithMembers;
      const isWorkspaceOwner = projectEntity.workspace.ownerId === userId;
      const isProjectMember = projectEntity.projectMembers.some(
        (pm) => pm.userId === userId,
      );
      if (!isWorkspaceOwner && !isProjectMember) {
        throw new ForbiddenException('You do not have access to this project');
      }
    } else if (commentableType === 'ticket') {
      entity = await this.prisma.ticket.findUnique({
        where: { id: commentableId },
      });
      if (!entity) {
        throw new NotFoundException('Ticket not found');
      }
      // For tickets, we might want to check CRM permissions
      // For now, allow if user exists
    } else {
      throw new BadRequestException(
        `Invalid commentable type: ${commentableType}`,
      );
    }

    return entity as CommentableEntity;
  }

  /**
   * Parse mentions from comment text (format: @username or @email)
   */
  private async parseMentions(commentText: string): Promise<string[]> {
    const mentionRegex = /@(\w+)/g;
    const matches = commentText.matchAll(mentionRegex);
    const mentionedUsernames = Array.from(matches, (m) => m[1]);

    if (mentionedUsernames.length === 0) {
      return [];
    }

    // Find users by email or username
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { in: mentionedUsernames } },
          // If you have a username field, add it here
        ],
      },
      select: { id: true },
    });

    return users.map((u) => u.id);
  }

  /**
   * Create mention records for a comment
   */
  private async createMentions(
    commentId: string,
    commentText: string,
    userId: string,
  ): Promise<MentionWithUser[]> {
    const mentionedUserIds = await this.parseMentions(commentText);

    if (mentionedUserIds.length === 0) {
      return [];
    }

    const mentions: MentionWithUser[] = [];
    for (const mentionedUserId of mentionedUserIds) {
      if (mentionedUserId === userId) {
        continue; // Don't mention yourself
      }

      const mention = await this.prisma.mention.create({
        data: withUlid({
          mentionableType: 'comment',
          mentionableId: commentId,
          mentionedUserId,
          commentId,
        }),
        include: {
          mentionedUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      mentions.push(mention);

      // Notify mentioned user
      await this.notificationEvents.notifyMentioned(
        mention.id,
        'comment',
        commentId,
        userId,
        mentionedUserId,
      );

      // Emit WebSocket event
      this.wsEvents.emitMentionCreated(mention);
    }

    return mentions;
  }

  // Comments
  async createComment(
    userId: string,
    data: {
      commentableType: string;
      commentableId: string;
      commentText: string;
      parentCommentId?: string;
    },
  ) {
    // Verify commentable entity access
    const entity = await this.verifyCommentableAccess(
      data.commentableType,
      data.commentableId,
      userId,
    );

    const comment = await this.prisma.comment.create({
      data: withUlid({
        commentableType: data.commentableType,
        commentableId: data.commentableId,
        userId,
        commentText: data.commentText,
        parentCommentId: data.parentCommentId,
        isDeleted: false,
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

    // Create mentions
    const mentions = await this.createMentions(
      comment.id,
      data.commentText,
      userId,
    );

    // Get users to notify based on entity type
    let notifyUserIds: string[] = [];
    if (data.commentableType === 'task' && hasProject(entity)) {
      // Get assignees from polymorphic assignments
      const assignments = await this.prisma.assignment.findMany({
        where: {
          assignableType: 'task',
          assignableId: data.commentableId,
        },
        select: { assigneeId: true },
      });
      const assigneeIds = assignments.map((a) => a.assigneeId);
      const projectMembers = entity.project.projectMembers.map(
        (pm) => pm.userId,
      );
      notifyUserIds = [...new Set([...assigneeIds, ...projectMembers])];
    } else if (
      data.commentableType === 'project' &&
      hasProjectMembers(entity)
    ) {
      notifyUserIds = entity.projectMembers.map((pm) => pm.userId);
    }

    // Remove the comment author and already mentioned users
    notifyUserIds = notifyUserIds.filter(
      (id) => id !== userId && !mentions.some((m) => m.mentionedUserId === id),
    );

    if (notifyUserIds.length > 0) {
      await this.notificationEvents.notifyCommentAdded(
        data.commentableId,
        comment.id,
        userId,
        data.commentText,
        notifyUserIds,
      );
    }

    // Emit WebSocket event
    const room = `${data.commentableType}:${data.commentableId}`;
    // For backward compatibility, extract projectId if it's a task
    const projectId =
      data.commentableType === 'task' && hasProject(entity)
        ? entity.projectId
        : undefined;
    this.wsEvents.emitCommentAdded(data.commentableId, projectId, comment);

    return {
      ...comment,
      mentions,
    };
  }

  async getComments(queryDto: CommentQueryDto, userId: string) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );

    const where: Prisma.CommentWhereInput = {};

    if (queryDto.commentableType) {
      where.commentableType = queryDto.commentableType;
    }

    if (queryDto.commentableId) {
      where.commentableId = queryDto.commentableId;
    }

    // Filter deleted comments
    if (!queryDto.includeDeleted) {
      where.isDeleted = false;
    }

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
          replies: {
            where: {
              isDeleted: false,
            },
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
          mentions: {
            include: {
              mentionedUser: {
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
      this.prisma.comment.count({ where }),
    ]);

    return buildPaginationResponse(comments, total, page, limit);
  }

  async updateComment(
    commentId: string,
    userId: string,
    data: { commentText: string },
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.isDeleted) {
      throw new BadRequestException('Cannot update deleted comment');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    await this.verifyCommentableAccess(
      comment.commentableType,
      comment.commentableId,
      userId,
    );

    // Delete old mentions and create new ones
    await this.prisma.mention.deleteMany({
      where: {
        mentionableType: 'comment',
        mentionableId: commentId,
      },
    });

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
        mentions: {
          include: {
            mentionedUser: {
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
    });

    // Create new mentions
    await this.createMentions(commentId, data.commentText, userId);

    // Emit WebSocket event
    const room = `${comment.commentableType}:${comment.commentableId}`;
    this.wsEvents.emitCommentUpdated(
      room,
      comment.commentableId,
      commentId,
      updatedComment,
    );

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

    await this.verifyCommentableAccess(
      comment.commentableType,
      comment.commentableId,
      userId,
    );

    // Soft delete
    const deletedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Emit WebSocket event
    const room = `${comment.commentableType}:${comment.commentableId}`;
    this.wsEvents.emitCommentUpdated(
      room,
      comment.commentableId,
      commentId,
      deletedComment,
    );

    return deletedComment;
  }

  // Time Logs (unchanged, still task-specific)
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
    const assignments = await this.prisma.assignment.findMany({
      where: {
        assignableType: 'task',
        assignableId: data.taskId,
      },
      select: { assigneeId: true },
    });
    const assigneeIds = assignments.map((a) => a.assigneeId);
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

  async getTaskTimeLogs(
    queryDto: TimeLogQueryDto,
    taskId: string,
    userId: string,
  ) {
    await this.verifyTaskAccess(taskId, userId);

    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );

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

  // Files - Now using unified file system
  async getTaskAttachments(taskId: string, userId: string) {
    await this.verifyTaskAccess(taskId, userId);

    return this.prisma.file.findMany({
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

  private async verifyTaskAccess(
    taskId: string,
    userId: string,
  ): Promise<TaskWithProject> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            workspace: {
              select: {
                id: true,
                ownerId: true,
              },
            },
            projectMembers: {
              select: {
                userId: true,
                memberRole: true,
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
