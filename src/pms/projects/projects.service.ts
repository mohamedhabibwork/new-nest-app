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
import { ProjectQueryDto } from './dto/project-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private rbacService: RbacService,
    private notificationEvents: NotificationEventsService,
    private wsEvents: WebSocketEventsService,
  ) {}

  async create(
    userId: string,
    data: {
      workspaceId: string;
      projectName: string;
      description?: string;
      startDate?: Date;
      endDate?: Date;
      priority?: string;
    },
  ) {
    // Verify workspace exists and user has access
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: data.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    const project = await this.prisma.project.create({
      data: withUlid({
        workspaceId: data.workspaceId,
        projectName: data.projectName,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority || 'medium',
        projectManagerId: userId,
      }),
    });

    // Add creator as project member
    await this.prisma.projectMember.create({
      data: withUlid({
        projectId: project.id,
        userId,
        memberRole: 'project_manager',
      }),
    });

    // Notify workspace owner about new project (if different from creator)
    if (workspace.ownerId !== userId) {
      await this.notificationEvents.notifyProjectCreated(project.id, userId, [
        workspace.ownerId,
      ]);
    }

    // Emit WebSocket event
    this.wsEvents.emitProjectCreated(project.id, data.workspaceId, project);

    return project;
  }

  async findAll(queryDto: ProjectQueryDto, userId: string) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );

    // Build where clause
    const where: Prisma.ProjectWhereInput = {};

    if (queryDto.workspaceId) {
      // Verify workspace access
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: queryDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      if (workspace.ownerId !== userId) {
        throw new ForbiddenException(
          'You do not have access to this workspace',
        );
      }

      where.workspaceId = queryDto.workspaceId;
    } else {
      // If no workspaceId, get all workspaces user has access to
      const userWorkspaces = await this.prisma.workspace.findMany({
        where: {
          ownerId: userId,
        },
        select: { id: true },
      });

      if (userWorkspaces.length === 0) {
        return buildPaginationResponse([], 0, page, limit);
      }

      where.workspaceId = {
        in: userWorkspaces.map((w) => w.id),
      };
    }

    // Apply filters
    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.search) {
      where.OR = [
        { projectName: { contains: queryDto.search, mode: 'insensitive' } },
        { description: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.ProjectOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      projectName: 'projectName',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'createdAt';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    // Execute query
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          projectMembers: {
            take: 5, // Limit members for list view
          },
          milestones: {
            take: 5, // Limit milestones for list view
          },
          tasks: {
            take: 5, // Limit tasks for list view
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return buildPaginationResponse(projects, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        workspace: true,
        projectMembers: {
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
        milestones: true,
        tasks: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is workspace owner or project member
    const isWorkspaceOwner = project.workspace.ownerId === userId;
    const isProjectMember = project.projectMembers.some(
      (pm) => pm.userId === userId,
    );

    if (!isWorkspaceOwner && !isProjectMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(
    id: string,
    userId: string,
    data: {
      projectName?: string;
      description?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      priority?: string;
    },
  ) {
    const project = await this.findOne(id, userId);

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);

    return this.prisma.project.delete({
      where: { id },
    });
  }
}
