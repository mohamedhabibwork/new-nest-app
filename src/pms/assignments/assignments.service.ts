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
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
    private wsEvents: WebSocketEventsService,
  ) {}

  /**
   * Verify that the assignable entity exists and user has access
   */
  private async verifyAssignableAccess(
    assignableType: string,
    assignableId: string,
    userId: string,
  ) {
    let entity;
    if (assignableType === 'task') {
      entity = await this.prisma.task.findUnique({
        where: { id: assignableId },
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
      const isWorkspaceOwner = entity.project.workspace.ownerId === userId;
      const isProjectMember = entity.project.projectMembers.some(
        (pm) => pm.userId === userId,
      );
      if (!isWorkspaceOwner && !isProjectMember) {
        throw new ForbiddenException('You do not have access to this task');
      }
    } else if (assignableType === 'project') {
      entity = await this.prisma.project.findUnique({
        where: { id: assignableId },
        include: {
          workspace: true,
          projectMembers: true,
        },
      });
      if (!entity) {
        throw new NotFoundException('Project not found');
      }
      const isWorkspaceOwner = entity.workspace.ownerId === userId;
      const isProjectMember = entity.projectMembers.some(
        (pm) => pm.userId === userId,
      );
      if (!isWorkspaceOwner && !isProjectMember) {
        throw new ForbiddenException('You do not have access to this project');
      }
    } else if (assignableType === 'ticket') {
      entity = await this.prisma.ticket.findUnique({
        where: { id: assignableId },
      });
      if (!entity) {
        throw new NotFoundException('Ticket not found');
      }
    } else {
      throw new BadRequestException(
        `Invalid assignable type: ${assignableType}`,
      );
    }

    return entity;
  }

  async create(userId: string, createDto: CreateAssignmentDto) {
    // Verify assignable entity exists and user has access
    await this.verifyAssignableAccess(
      createDto.assignableType,
      createDto.assignableId,
      userId,
    );

    // Verify assignee exists
    const assignee = await this.prisma.user.findUnique({
      where: { id: createDto.assigneeId },
    });
    if (!assignee) {
      throw new NotFoundException('Assignee not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.assignment.findFirst({
      where: {
        assignableType: createDto.assignableType,
        assignableId: createDto.assignableId,
        assigneeId: createDto.assigneeId,
        status: {
          notIn: ['completed', 'declined'],
        },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('Active assignment already exists');
    }

    const assignment = await this.prisma.assignment.create({
      data: withUlid({
        assignableType: createDto.assignableType,
        assignableId: createDto.assignableId,
        assigneeId: createDto.assigneeId,
        assignerId: userId,
        status: 'pending',
        priority: createDto.priority || 'medium',
        dueDate: createDto.dueDate,
        notes: createDto.notes,
      }),
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assigner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify assignee
    await this.notificationEvents.notifyAssignmentCreated(
      assignment.id,
      createDto.assignableType,
      createDto.assignableId,
      userId,
      createDto.assigneeId,
      createDto.priority,
      createDto.dueDate,
    );

    // Emit WebSocket event
    this.wsEvents.emitAssignmentCreated(assignment);

    return assignment;
  }

  async findAll(queryDto: AssignmentQueryDto, userId: string) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );
    const skip = (page - 1) * limit;

    const where: Prisma.AssignmentWhereInput = {};

    if (queryDto.assignableType) {
      where.assignableType = queryDto.assignableType;
    }

    if (queryDto.assignableId) {
      where.assignableId = queryDto.assignableId;
    }

    if (queryDto.assigneeId) {
      where.assigneeId = queryDto.assigneeId;
    }

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.priority) {
      where.priority = queryDto.priority;
    }

    const [assignments, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          assigner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          assignedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.assignment.count({ where }),
    ]);

    return buildPaginationResponse(assignments, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assigner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Verify user has access: assignee, assigner, or has access to the assignable entity
    const isAssignee = assignment.assigneeId === userId;
    const isAssigner = assignment.assignerId === userId;

    if (!isAssignee && !isAssigner) {
      // Check if user has access to the assignable entity
      await this.verifyAssignableAccess(
        assignment.assignableType,
        assignment.assignableId,
        userId,
      );
    }

    return assignment;
  }

  async update(id: string, userId: string, updateDto: UpdateAssignmentDto) {
    const assignment = await this.findOne(id, userId);

    // Only assignee or assigner can update
    if (assignment.assigneeId !== userId && assignment.assignerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this assignment',
      );
    }

    const updatedAssignment = await this.prisma.assignment.update({
      where: { id },
      data: {
        priority: updateDto.priority,
        dueDate: updateDto.dueDate,
        notes: updateDto.notes,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assigner: {
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
    this.wsEvents.emitAssignmentUpdated(updatedAssignment);

    return updatedAssignment;
  }

  async updateStatus(id: string, userId: string, status: string) {
    const assignment = await this.findOne(id, userId);

    // Only assignee can update status
    if (assignment.assigneeId !== userId) {
      throw new ForbiddenException('Only the assignee can update the status');
    }

    const validStatuses = [
      'pending',
      'accepted',
      'in_progress',
      'completed',
      'blocked',
      'declined',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const updateData: Prisma.AssignmentUpdateInput = {
      status,
    };

    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'pending' || status === 'declined') {
      updateData.completedAt = null;
    }

    const updatedAssignment = await this.prisma.assignment.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assigner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify assigner about status change
    if (assignment.assignerId !== userId) {
      await this.notificationEvents.notifyAssignmentStatusChanged(
        assignment.id,
        assignment.assignableType,
        assignment.assignableId,
        userId,
        assignment.assignerId,
        status,
      );
    }

    // Emit WebSocket event
    this.wsEvents.emitAssignmentUpdated(updatedAssignment);

    return updatedAssignment;
  }

  async remove(id: string, userId: string) {
    const assignment = await this.findOne(id, userId);

    // Only assigner can remove assignment
    if (assignment.assignerId !== userId) {
      throw new ForbiddenException(
        'Only the assigner can remove this assignment',
      );
    }

    await this.prisma.assignment.delete({
      where: { id },
    });

    // Emit WebSocket event
    this.wsEvents.emitAssignmentRemoved(
      id,
      assignment.assignableType,
      assignment.assignableId,
    );

    return { message: 'Assignment removed successfully' };
  }
}
