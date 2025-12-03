import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RbacService } from '../rbac/rbac.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import { buildPaginationResponse, normalizePaginationParams } from '../../common/utils/pagination.util';
import { WorkspaceQueryDto } from './dto/workspace-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private rbacService: RbacService,
  ) {}

  async create(userId: string, data: { workspaceName: string; description?: string }) {
    return this.prisma.workspace.create({
      data: withUlid({
        workspaceName: data.workspaceName,
        description: data.description,
        ownerId: userId,
      }),
    });
  }

  async findAll(queryDto: WorkspaceQueryDto, userId: string) {
    const { page, limit } = normalizePaginationParams(queryDto.page, queryDto.limit);

    // Build where clause
    const where: Prisma.WorkspaceWhereInput = {
      ownerId: userId,
    };

    // Apply search filter
    if (queryDto.search) {
      where.workspaceName = { contains: queryDto.search, mode: 'insensitive' };
    }

    // Build orderBy
    const orderBy: Prisma.WorkspaceOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      workspaceName: 'workspaceName',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'createdAt';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    // Execute query
    const [workspaces, total] = await Promise.all([
      this.prisma.workspace.findMany({
        where,
        include: {
          projects: {
            take: 5, // Limit projects for list view
          },
          teams: {
            take: 5, // Limit teams for list view
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.workspace.count({ where }),
    ]);

    return buildPaginationResponse(workspaces, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        projects: true,
        teams: {
          include: {
            teamMembers: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if user is owner
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return workspace;
  }

  async update(id: string, userId: string, data: { workspaceName?: string; description?: string }) {
    const workspace = await this.findOne(id, userId);

    return this.prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const workspace = await this.findOne(id, userId);

    return this.prisma.workspace.delete({
      where: { id },
    });
  }
}

