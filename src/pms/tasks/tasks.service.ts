import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RbacService } from '../rbac/rbac.service';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { WebSocketEventsService } from '../../websocket/websocket-events.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import {
  buildPaginationResponse,
  normalizePaginationParams,
} from '../../common/utils/pagination.util';
import { TaskQueryDto } from './dto/task-query.dto';
import { Prisma } from '@prisma/client';
import { TaskWithProject } from '../../common/types/polymorphic.types';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private rbacService: RbacService,
    private notificationEvents: NotificationEventsService,
    private wsEvents: WebSocketEventsService,
  ) {}

  async create(
    userId: string,
    data: {
      projectId: string;
      taskTitle: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: Date;
      estimatedHours?: number;
      parentTaskId?: string;
    },
  ) {
    // Verify project access
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
      include: {
        workspace: true,
        projectMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isWorkspaceOwner = project.workspace.ownerId === userId;
    const isProjectMember = project.projectMembers.some(
      (pm) => pm.userId === userId,
    );

    if (!isWorkspaceOwner && !isProjectMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const task = await this.prisma.task.create({
      data: withUlid({
        projectId: data.projectId,
        taskTitle: data.taskTitle,
        description: data.description,
        status: data.status || 'to_do',
        priority: data.priority || 'medium',
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours,
        parentTaskId: data.parentTaskId,
        createdBy: userId,
      }),
    });

    // Notify project members about new task
    const projectMembers = project.projectMembers.map((pm) => pm.userId);
    if (projectMembers.length > 0) {
      await this.notificationEvents.notifyProjectCreated(
        data.projectId,
        userId,
        projectMembers,
      );
    }

    // Emit WebSocket event
    this.wsEvents.emitTaskCreated(
      task.id,
      data.projectId,
      project.workspaceId,
      task,
    );

    return task;
  }

  async findAll(queryDto: TaskQueryDto, userId: string) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );

    // Build where clause
    const where: Prisma.TaskWhereInput = {};

    if (queryDto.projectId) {
      // Verify project access
      const project = await this.prisma.project.findUnique({
        where: { id: queryDto.projectId },
        include: {
          workspace: true,
          projectMembers: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const isWorkspaceOwner = project.workspace.ownerId === userId;
      const isProjectMember = project.projectMembers.some(
        (pm) => pm.userId === userId,
      );

      if (!isWorkspaceOwner && !isProjectMember) {
        throw new ForbiddenException('You do not have access to this project');
      }

      where.projectId = queryDto.projectId;
    } else {
      // If no projectId, get all projects user has access to
      const userProjects = await this.prisma.project.findMany({
        where: {
          OR: [
            {
              workspace: {
                ownerId: userId,
              },
            },
            {
              projectMembers: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
        select: { id: true },
      });

      if (userProjects.length === 0) {
        return buildPaginationResponse([], 0, page, limit);
      }

      where.projectId = {
        in: userProjects.map((p) => p.id),
      };
    }

    // Apply filters
    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.priority) {
      where.priority = queryDto.priority;
    }

    // Note: assigneeId filtering is handled via separate Assignment queries
    // since assignments are polymorphic and not a direct relation on Task

    if (queryDto.dueDateFrom || queryDto.dueDateTo) {
      where.dueDate = {};
      if (queryDto.dueDateFrom) {
        where.dueDate.gte = new Date(queryDto.dueDateFrom);
      }
      if (queryDto.dueDateTo) {
        where.dueDate.lte = new Date(queryDto.dueDateTo);
      }
    }

    if (queryDto.search) {
      where.OR = [
        { taskTitle: { contains: queryDto.search, mode: 'insensitive' } },
        { description: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    // Map sortBy to Prisma field names
    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      dueDate: 'dueDate',
      priority: 'priority',
      status: 'status',
      taskTitle: 'taskTitle',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'createdAt';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    // Execute query
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          checklistItems: {
            orderBy: { orderIndex: 'asc' },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return buildPaginationResponse(tasks, total, page, limit);
  }

  async getTaskAttachments(
    taskId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const task = await this.findOne(taskId, userId);
    const { page: normalizedPage, limit: normalizedLimit } =
      normalizePaginationParams(page, limit);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const [attachments, total] = await Promise.all([
      this.prisma.file.findMany({
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
        skip,
        take: normalizedLimit,
      }),
      this.prisma.file.count({
        where: {
          entityType: 'task',
          entityId: taskId,
        },
      }),
    ]);

    return buildPaginationResponse(
      attachments,
      total,
      normalizedPage,
      normalizedLimit,
    );
  }

  async findOne(id: string, userId: string): Promise<TaskWithProject> {
    const task = await this.prisma.task.findUnique({
      where: { id },
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
        checklistItems: true,
        timeLogs: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check access
    const taskWithProject = task as TaskWithProject;
    const isWorkspaceOwner =
      taskWithProject.project.workspace.ownerId === userId;
    const isProjectMember = taskWithProject.project.projectMembers.some(
      (pm) => pm.userId === userId,
    );

    if (!isWorkspaceOwner && !isProjectMember) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task as TaskWithProject;
  }

  async update(
    id: string,
    userId: string,
    data: {
      taskTitle?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: Date;
      estimatedHours?: number;
    },
  ) {
    const task = await this.findOne(id, userId);

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    const projectId = task.projectId;
    const workspaceId = task.project.workspace.id;

    await this.prisma.task.delete({
      where: { id },
    });

    // Emit WebSocket event
    this.wsEvents.emitTaskDeleted(id, projectId, workspaceId);

    return { message: 'Task deleted successfully' };
  }

  // Task Assignment Methods
  // Assignment methods removed - use AssignmentsModule instead
  // Convenience method to get assignments for a task (uses polymorphic Assignment model)
  async getTaskAssignments(
    taskId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Verify task access
    await this.findOne(taskId, userId);

    const { page: normalizedPage, limit: normalizedLimit } =
      normalizePaginationParams(page, limit);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const [assignments, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where: {
          assignableType: 'task',
          assignableId: taskId,
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
        orderBy: {
          assignedAt: 'desc',
        },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.assignment.count({
        where: {
          assignableType: 'task',
          assignableId: taskId,
        },
      }),
    ]);

    return buildPaginationResponse(
      assignments,
      total,
      normalizedPage,
      normalizedLimit,
    );
  }

  // Task Dependency Methods
  async addTaskDependency(
    taskId: string,
    dependsOnTaskId: string,
    dependencyType: 'blocks' | 'blocked_by' | 'relates_to',
    userId: string,
  ) {
    // Verify task access
    const task = await this.findOne(taskId, userId);

    // Verify depends on task exists and user has access
    const dependsOnTask = await this.findOne(dependsOnTaskId, userId);

    // Prevent self-dependency
    if (taskId === dependsOnTaskId) {
      throw new ForbiddenException('A task cannot depend on itself');
    }

    // Check if tasks are in the same project
    if (task.projectId !== dependsOnTask.projectId) {
      throw new ForbiddenException(
        'Tasks must be in the same project to create a dependency',
      );
    }

    // Check if dependency already exists
    const existingDependency = await this.prisma.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId,
          dependsOnTaskId,
        },
      },
    });

    if (existingDependency) {
      throw new ForbiddenException('Dependency already exists');
    }

    // Check for circular dependencies
    const wouldCreateCycle = await this.checkCircularDependency(
      taskId,
      dependsOnTaskId,
    );
    if (wouldCreateCycle) {
      throw new ForbiddenException(
        'This dependency would create a circular reference',
      );
    }

    // Create dependency
    const dependency = await this.prisma.taskDependency.create({
      data: withUlid({
        taskId,
        dependsOnTaskId,
        dependencyType,
      }),
      include: {
        dependsOnTask: {
          select: {
            id: true,
            taskTitle: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    // Emit WebSocket event
    const taskWithProject = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true, project: { select: { workspaceId: true } } },
    });
    if (taskWithProject) {
      this.wsEvents.emitTaskUpdated(
        taskId,
        taskWithProject.projectId,
        taskWithProject.project.workspaceId,
        task,
      );
    }

    return dependency;
  }

  private async checkCircularDependency(
    taskId: string,
    dependsOnTaskId: string,
  ): Promise<boolean> {
    // Check if dependsOnTaskId depends on taskId (directly or indirectly)
    const visited = new Set<string>();
    const queue = [dependsOnTaskId];

    while (queue.length > 0) {
      const currentTaskId = queue.shift()!;

      if (currentTaskId === taskId) {
        return true; // Circular dependency found
      }

      if (visited.has(currentTaskId)) {
        continue;
      }

      visited.add(currentTaskId);

      // Get all tasks that currentTaskId depends on
      const dependencies = await this.prisma.taskDependency.findMany({
        where: { taskId: currentTaskId },
        select: { dependsOnTaskId: true },
      });

      for (const dep of dependencies) {
        queue.push(dep.dependsOnTaskId);
      }
    }

    return false;
  }

  async removeTaskDependency(
    taskId: string,
    dependencyId: string,
    userId: string,
  ) {
    // Verify task access
    await this.findOne(taskId, userId);

    const dependency = await this.prisma.taskDependency.findUnique({
      where: { id: dependencyId },
    });

    if (!dependency || dependency.taskId !== taskId) {
      throw new NotFoundException('Dependency not found');
    }

    await this.prisma.taskDependency.delete({
      where: { id: dependencyId },
    });

    // Emit WebSocket event
    const task = await this.findOne(taskId, userId);
    const taskWithProject = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true, project: { select: { workspaceId: true } } },
    });
    if (taskWithProject) {
      this.wsEvents.emitTaskUpdated(
        taskId,
        taskWithProject.projectId,
        taskWithProject.project.workspaceId,
        task,
      );
    }

    return { message: 'Dependency removed successfully' };
  }

  async getTaskDependencies(
    taskId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Verify task access
    await this.findOne(taskId, userId);

    const skip = (page - 1) * limit;

    const [dependencies, total] = await Promise.all([
      this.prisma.taskDependency.findMany({
        where: { taskId },
        include: {
          dependsOnTask: {
            select: {
              id: true,
              taskTitle: true,
              status: true,
              priority: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.taskDependency.count({
        where: { taskId },
      }),
    ]);

    return {
      data: dependencies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  // Checklist Methods
  async addChecklistItem(
    taskId: string,
    userId: string,
    itemText: string,
    orderIndex?: number,
  ) {
    // Verify task access
    const task = await this.findOne(taskId, userId);

    // Get max order index if not provided
    if (orderIndex === undefined) {
      const maxOrder = await this.prisma.checklistItem.aggregate({
        where: { taskId },
        _max: { orderIndex: true },
      });
      orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;
    }

    const checklistItem = await this.prisma.checklistItem.create({
      data: withUlid({
        taskId,
        itemText,
        orderIndex,
        isCompleted: false,
      }),
    });

    // Emit WebSocket event
    const taskWithProject = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true, project: { select: { workspaceId: true } } },
    });
    if (taskWithProject) {
      this.wsEvents.emitTaskUpdated(
        taskId,
        taskWithProject.projectId,
        taskWithProject.project.workspaceId,
        task,
      );
    }

    return checklistItem;
  }

  async updateChecklistItem(
    taskId: string,
    itemId: string,
    userId: string,
    data: { itemText?: string; isCompleted?: boolean },
  ) {
    // Verify task access
    const task = await this.findOne(taskId, userId);

    const checklistItem = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!checklistItem || checklistItem.taskId !== taskId) {
      throw new NotFoundException('Checklist item not found');
    }

    const updatedItem = await this.prisma.checklistItem.update({
      where: { id: itemId },
      data,
    });

    // Emit WebSocket event
    const taskWithProject = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true, project: { select: { workspaceId: true } } },
    });
    if (taskWithProject) {
      this.wsEvents.emitTaskUpdated(
        taskId,
        taskWithProject.projectId,
        taskWithProject.project.workspaceId,
        task,
      );
    }

    return updatedItem;
  }

  async deleteChecklistItem(taskId: string, itemId: string, userId: string) {
    // Verify task access
    const task = await this.findOne(taskId, userId);

    const checklistItem = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!checklistItem || checklistItem.taskId !== taskId) {
      throw new NotFoundException('Checklist item not found');
    }

    await this.prisma.checklistItem.delete({
      where: { id: itemId },
    });

    // Emit WebSocket event
    const taskWithProject = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true, project: { select: { workspaceId: true } } },
    });
    if (taskWithProject) {
      this.wsEvents.emitTaskUpdated(
        taskId,
        taskWithProject.projectId,
        taskWithProject.project.workspaceId,
        task,
      );
    }

    return { message: 'Checklist item deleted successfully' };
  }

  async getChecklistItems(
    taskId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Verify task access
    await this.findOne(taskId, userId);

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.checklistItem.findMany({
        where: { taskId },
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.checklistItem.count({
        where: { taskId },
      }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  async reorderChecklistItems(
    taskId: string,
    userId: string,
    itemIds: string[],
  ) {
    // Verify task access
    const task = await this.findOne(taskId, userId);

    // Verify all items belong to this task
    const items = await this.prisma.checklistItem.findMany({
      where: {
        id: { in: itemIds },
        taskId,
      },
    });

    if (items.length !== itemIds.length) {
      throw new ForbiddenException(
        'Some checklist items do not belong to this task',
      );
    }

    // Update order indices
    const updatePromises = itemIds.map((itemId, index) =>
      this.prisma.checklistItem.update({
        where: { id: itemId },
        data: { orderIndex: index },
      }),
    );

    await Promise.all(updatePromises);

    // Emit WebSocket event
    const taskWithProject = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true, project: { select: { workspaceId: true } } },
    });
    if (taskWithProject) {
      this.wsEvents.emitTaskUpdated(
        taskId,
        taskWithProject.projectId,
        taskWithProject.project.workspaceId,
        task,
      );
    }

    return { message: 'Checklist items reordered successfully' };
  }
}
