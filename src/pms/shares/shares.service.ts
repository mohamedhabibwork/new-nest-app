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
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';
import { ShareQueryDto } from './dto/share-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SharesService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
    private wsEvents: WebSocketEventsService,
  ) {}

  /**
   * Verify that the shareable entity exists and user has access
   */
  private async verifyShareableAccess(
    shareableType: string,
    shareableId: string,
    userId: string,
  ) {
    // Verify entity exists
    let entity;
    if (shareableType === 'task') {
      entity = await this.prisma.task.findUnique({
        where: { id: shareableId },
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
      // Check access: workspace owner or project member
      const isWorkspaceOwner = entity.project.workspace.ownerId === userId;
      const isProjectMember = entity.project.projectMembers.some(
        (pm) => pm.userId === userId,
      );
      if (!isWorkspaceOwner && !isProjectMember) {
        throw new ForbiddenException('You do not have access to this task');
      }
    } else if (shareableType === 'project') {
      entity = await this.prisma.project.findUnique({
        where: { id: shareableId },
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
    } else if (shareableType === 'ticket') {
      entity = await this.prisma.ticket.findUnique({
        where: { id: shareableId },
      });
      if (!entity) {
        throw new NotFoundException('Ticket not found');
      }
      // For tickets, we might want to check CRM permissions
      // For now, allow if user exists
    } else {
      throw new BadRequestException(`Invalid shareable type: ${shareableType}`);
    }

    return entity;
  }

  /**
   * Verify that the shared with entity exists
   */
  private async verifySharedWith(sharedWithType: string, sharedWithId: string) {
    if (sharedWithType === 'users') {
      const user = await this.prisma.user.findUnique({
        where: { id: sharedWithId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
    } else if (sharedWithType === 'teams') {
      const team = await this.prisma.team.findUnique({
        where: { id: sharedWithId },
      });
      if (!team) {
        throw new NotFoundException('Team not found');
      }
    } else {
      throw new BadRequestException(
        `Invalid shared with type: ${sharedWithType}`,
      );
    }
  }

  async create(userId: string, createDto: CreateShareDto) {
    // Verify shareable entity exists and user has access
    await this.verifyShareableAccess(
      createDto.shareableType,
      createDto.shareableId,
      userId,
    );

    // Verify shared with entity exists
    await this.verifySharedWith(
      createDto.sharedWithType,
      createDto.sharedWithId,
    );

    // Check if share already exists
    const existingShare = await this.prisma.share.findFirst({
      where: {
        shareableType: createDto.shareableType,
        shareableId: createDto.shareableId,
        sharedWithType: createDto.sharedWithType,
        sharedWithId: createDto.sharedWithId,
      },
    });

    if (existingShare) {
      throw new BadRequestException('Share already exists');
    }

    const share = await this.prisma.share.create({
      data: withUlid({
        shareableType: createDto.shareableType,
        shareableId: createDto.shareableId,
        sharedWithType: createDto.sharedWithType,
        sharedWithId: createDto.sharedWithId,
        permission: createDto.permission || 'view',
        sharedById: userId,
        expiresAt: createDto.expiresAt,
      }),
      include: {
        sharedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify the recipient
    if (createDto.sharedWithType === 'users') {
      await this.notificationEvents.notifyShareCreated(
        share.id,
        createDto.shareableType,
        createDto.shareableId,
        userId,
        createDto.sharedWithId,
        createDto.permission,
      );
    } else if (createDto.sharedWithType === 'teams') {
      // Get team members and notify them
      const teamMembers = await this.prisma.teamMember.findMany({
        where: { teamId: createDto.sharedWithId },
        select: { userId: true },
      });
      const memberIds = teamMembers.map((tm) => tm.userId);
      for (const memberId of memberIds) {
        await this.notificationEvents.notifyShareCreated(
          share.id,
          createDto.shareableType,
          createDto.shareableId,
          userId,
          memberId,
          createDto.permission,
        );
      }
    }

    // Emit WebSocket event
    this.wsEvents.emitShareCreated(share);

    return share;
  }

  async findAll(queryDto: ShareQueryDto, userId: string) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );
    const skip = (page - 1) * limit;

    const where: Prisma.ShareWhereInput = {};

    if (queryDto.shareableType) {
      where.shareableType = queryDto.shareableType;
    }

    if (queryDto.shareableId) {
      where.shareableId = queryDto.shareableId;
    }

    if (queryDto.sharedWithType) {
      where.sharedWithType = queryDto.sharedWithType;
    }

    if (queryDto.sharedWithId) {
      where.sharedWithId = queryDto.sharedWithId;
    }

    if (queryDto.permission) {
      where.permission = queryDto.permission;
    }

    const [shares, total] = await Promise.all([
      this.prisma.share.findMany({
        where,
        include: {
          sharedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.share.count({ where }),
    ]);

    return buildPaginationResponse(shares, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    const share = await this.prisma.share.findUnique({
      where: { id },
      include: {
        sharedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Verify user has access to view this share
    // User can view if they created it, or if they are the recipient
    const isCreator = share.sharedById === userId;
    const isRecipient =
      share.sharedWithType === 'users' && share.sharedWithId === userId;

    if (!isCreator && !isRecipient) {
      // For teams, check if user is a team member
      if (share.sharedWithType === 'teams') {
        const teamMember = await this.prisma.teamMember.findFirst({
          where: {
            teamId: share.sharedWithId,
            userId,
          },
        });
        if (!teamMember) {
          throw new ForbiddenException('You do not have access to this share');
        }
      } else {
        throw new ForbiddenException('You do not have access to this share');
      }
    }

    return share;
  }

  async update(id: string, userId: string, updateDto: UpdateShareDto) {
    const share = await this.findOne(id, userId);

    // Only the creator can update the share
    if (share.sharedById !== userId) {
      throw new ForbiddenException('Only the creator can update this share');
    }

    const updatedShare = await this.prisma.share.update({
      where: { id },
      data: {
        permission: updateDto.permission,
        expiresAt: updateDto.expiresAt,
      },
      include: {
        sharedBy: {
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
    this.wsEvents.emitShareUpdated(updatedShare);

    return updatedShare;
  }

  async remove(id: string, userId: string) {
    const share = await this.findOne(id, userId);

    // Only the creator can remove the share
    if (share.sharedById !== userId) {
      throw new ForbiddenException('Only the creator can remove this share');
    }

    await this.prisma.share.delete({
      where: { id },
    });

    // Emit WebSocket event
    this.wsEvents.emitShareRemoved(id, share.shareableType, share.shareableId);

    return { message: 'Share removed successfully' };
  }

  async getSharedContent(userId: string, page = 1, limit = 50) {
    const { page: normalizedPage, limit: normalizedLimit } =
      normalizePaginationParams(page, limit);
    const skip = (normalizedPage - 1) * normalizedLimit;

    // Get user's team IDs
    const userTeams = await this.prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true },
    });
    const teamIds = userTeams.map((ut) => ut.teamId);

    // Get shares where user is the recipient (direct or via team)
    const userShares = await this.prisma.share.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                sharedWithType: 'users',
                sharedWithId: userId,
              },
              ...(teamIds.length > 0
                ? [
                    {
                      sharedWithType: 'teams',
                      sharedWithId: {
                        in: teamIds,
                      },
                    },
                  ]
                : []),
            ],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        ],
      },
      include: {
        sharedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: normalizedLimit,
    });

    const total = await this.prisma.share.count({
      where: {
        AND: [
          {
            OR: [
              {
                sharedWithType: 'users',
                sharedWithId: userId,
              },
              ...(teamIds.length > 0
                ? [
                    {
                      sharedWithType: 'teams',
                      sharedWithId: {
                        in: teamIds,
                      },
                    },
                  ]
                : []),
            ],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        ],
      },
    });

    return buildPaginationResponse(
      userShares,
      total,
      normalizedPage,
      normalizedLimit,
    );
  }
}
