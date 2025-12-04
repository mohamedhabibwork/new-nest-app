import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import {
  buildPaginationResponse,
  normalizePaginationParams,
} from '../../common/utils/pagination.util';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { CreateTaggingDto } from './dto/create-tagging.dto';
import { Prisma } from '@prisma/client';
import { NotificationEventsService } from '../notifications/notification-events.service';

@Injectable()
export class TagsService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
  ) {}

  // ============================================
  // Tag Management
  // ============================================

  async create(userId: string, createDto: CreateTagDto) {
    // Check if tag with same name already exists
    const existingTag = await this.prisma.tag.findUnique({
      where: { tagName: createDto.tagName },
    });

    if (existingTag) {
      throw new BadRequestException('Tag with this name already exists');
    }

    const tag = await this.prisma.tag.create({
      data: withUlid({
        tagName: createDto.tagName,
        color: createDto.color,
        creatorId: userId,
        visibility: createDto.visibility || 'public',
        usageCount: 0,
      }),
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return tag;
  }

  async findAll(queryDto: TagQueryDto, userId: string) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );
    const skip = (page - 1) * limit;

    const where: Prisma.TagWhereInput = {};

    // Filter by visibility: show public tags and user's private tags
    where.OR = [{ visibility: 'public' }, { creatorId: userId }];

    if (queryDto.search) {
      where.tagName = {
        contains: queryDto.search,
        mode: 'insensitive',
      };
    }

    if (queryDto.visibility) {
      where.visibility = queryDto.visibility;
    }

    if (queryDto.creatorId) {
      where.creatorId = queryDto.creatorId;
    }

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          usageCount: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.tag.count({ where }),
    ]);

    return buildPaginationResponse(tags, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check visibility: public tags or user's private tags
    if (tag.visibility === 'private' && tag.creatorId !== userId) {
      throw new ForbiddenException('You do not have access to this tag');
    }

    return tag;
  }

  async update(id: string, userId: string, updateDto: UpdateTagDto) {
    const tag = await this.findOne(id, userId);

    // Only creator can update
    if (tag.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can update this tag');
    }

    // If updating tag name, check for duplicates
    if (updateDto.tagName && updateDto.tagName !== tag.tagName) {
      const existingTag = await this.prisma.tag.findUnique({
        where: { tagName: updateDto.tagName },
      });
      if (existingTag) {
        throw new BadRequestException('Tag with this name already exists');
      }
    }

    const updatedTag = await this.prisma.tag.update({
      where: { id },
      data: {
        tagName: updateDto.tagName,
        color: updateDto.color,
        visibility: updateDto.visibility,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedTag;
  }

  async remove(id: string, userId: string) {
    const tag = await this.findOne(id, userId);

    // Only creator can delete
    if (tag.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can delete this tag');
    }

    // Check if tag is in use
    if (tag.usageCount > 0) {
      throw new BadRequestException('Cannot delete tag that is in use');
    }

    await this.prisma.tag.delete({
      where: { id },
    });

    return { message: 'Tag deleted successfully' };
  }

  // ============================================
  // Tagging Management
  // ============================================

  /**
   * Verify that the taggable entity exists and user has access
   */
  private async verifyTaggableAccess(
    taggableType: string,
    taggableId: string,
    userId: string,
  ) {
    let entity;
    if (taggableType === 'task') {
      entity = await this.prisma.task.findUnique({
        where: { id: taggableId },
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
    } else if (taggableType === 'project') {
      entity = await this.prisma.project.findUnique({
        where: { id: taggableId },
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
    } else if (taggableType === 'ticket') {
      entity = await this.prisma.ticket.findUnique({
        where: { id: taggableId },
      });
      if (!entity) {
        throw new NotFoundException('Ticket not found');
      }
    } else {
      throw new BadRequestException(`Invalid taggable type: ${taggableType}`);
    }

    return entity;
  }

  async addTagging(userId: string, createDto: CreateTaggingDto) {
    // Verify tag exists and is accessible
    const tag = await this.findOne(createDto.tagId, userId);

    // Verify taggable entity exists and user has access
    await this.verifyTaggableAccess(
      createDto.taggableType,
      createDto.taggableId,
      userId,
    );

    // Check if tagging already exists
    const existingTagging = await this.prisma.tagging.findUnique({
      where: {
        tagId_taggableType_taggableId: {
          tagId: createDto.tagId,
          taggableType: createDto.taggableType,
          taggableId: createDto.taggableId,
        },
      },
    });

    if (existingTagging) {
      throw new BadRequestException('Tagging already exists');
    }

    const tagging = await this.prisma.tagging.create({
      data: withUlid({
        tagId: createDto.tagId,
        taggableType: createDto.taggableType,
        taggableId: createDto.taggableId,
        createdById: userId,
      }),
      include: {
        tag: {
          select: {
            id: true,
            tagName: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update tag usage count
    await this.prisma.tag.update({
      where: { id: createDto.tagId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    // Get users to notify based on entity type
    let notifyUserIds: string[] = [];
    if (createDto.taggableType === 'task') {
      const task = await this.prisma.task.findUnique({
        where: { id: createDto.taggableId },
        include: {
          project: {
            include: {
              projectMembers: { select: { userId: true } },
            },
          },
        },
      });
      if (task) {
        const assignments = await this.prisma.assignment.findMany({
          where: {
            assignableType: 'task',
            assignableId: createDto.taggableId,
          },
          select: { assigneeId: true },
        });
        const assigneeIds = assignments.map((a) => a.assigneeId);
        const projectMemberIds = task.project.projectMembers.map(
          (pm) => pm.userId,
        );
        notifyUserIds = [...new Set([...assigneeIds, ...projectMemberIds])];
      }
    } else if (createDto.taggableType === 'project') {
      const project = await this.prisma.project.findUnique({
        where: { id: createDto.taggableId },
        include: {
          projectMembers: { select: { userId: true } },
        },
      });
      if (project) {
        notifyUserIds = project.projectMembers.map((pm) => pm.userId);
      }
    }

    // Remove the user who created the tagging
    notifyUserIds = notifyUserIds.filter((id) => id !== userId);

    // Notify users about tagging
    if (notifyUserIds.length > 0) {
      await this.notificationEvents.notifyTaggableTagged(
        tagging.id,
        createDto.tagId,
        createDto.taggableType,
        createDto.taggableId,
        userId,
        notifyUserIds,
      );
    }

    return tagging;
  }

  async removeTagging(
    tagId: string,
    taggableType: string,
    taggableId: string,
    userId: string,
  ) {
    // Verify taggable entity exists and user has access
    await this.verifyTaggableAccess(taggableType, taggableId, userId);

    const tagging = await this.prisma.tagging.findUnique({
      where: {
        tagId_taggableType_taggableId: {
          tagId,
          taggableType,
          taggableId,
        },
      },
    });

    if (!tagging) {
      throw new NotFoundException('Tagging not found');
    }

    await this.prisma.tagging.delete({
      where: {
        tagId_taggableType_taggableId: {
          tagId,
          taggableType,
          taggableId,
        },
      },
    });

    // Update tag usage count
    await this.prisma.tag.update({
      where: { id: tagId },
      data: {
        usageCount: {
          decrement: 1,
        },
      },
    });

    return { message: 'Tagging removed successfully' };
  }

  async getTaggings(taggableType: string, taggableId: string, userId: string) {
    // Verify taggable entity exists and user has access
    await this.verifyTaggableAccess(taggableType, taggableId, userId);

    const taggings = await this.prisma.tagging.findMany({
      where: {
        taggableType,
        taggableId,
      },
      include: {
        tag: {
          select: {
            id: true,
            tagName: true,
            color: true,
          },
        },
        createdBy: {
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
    });

    return taggings;
  }
}
