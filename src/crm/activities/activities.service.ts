import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import {
  buildPaginationResponse,
  normalizePaginationParams,
} from '../../common/utils/pagination.util';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateActivityDto) {
    // Validate that at least one entity (contact, company, or deal) is provided
    if (!data.contactId && !data.companyId && !data.dealId) {
      throw new BadRequestException(
        'At least one of contactId, companyId, or dealId must be provided',
      );
    }

    // Verify contact exists if provided
    if (data.contactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: data.contactId },
      });
      if (!contact || contact.isDeleted) {
        throw new NotFoundException('Contact not found');
      }
    }

    // Verify company exists if provided
    if (data.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    // Note: Deal verification will be added in Phase 2

    const activity = await this.prisma.crmActivity.create({
      data: withUlid({
        activityType: data.activityType,
        contactId: data.contactId,
        companyId: data.companyId,
        dealId: data.dealId,
        userId,
        subject: data.subject,
        description: data.description,
        direction: data.direction,
        activityDate: new Date(data.activityDate),
        durationMinutes: data.durationMinutes,
        metadata: data.metadata as Prisma.InputJsonValue,
      }),
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
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

    // Update lastContacted for contact if this is a contact-related activity
    if (data.contactId && data.activityDate) {
      await this.prisma.contact.update({
        where: { id: data.contactId },
        data: { lastContacted: new Date(data.activityDate) },
      });
    }

    return activity;
  }

  async findAll(queryDto: ActivityQueryDto) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );

    // Build where clause
    const where: Prisma.CrmActivityWhereInput = {};

    if (queryDto.contactId) {
      where.contactId = queryDto.contactId;
    }

    if (queryDto.companyId) {
      where.companyId = queryDto.companyId;
    }

    if (queryDto.dealId) {
      where.dealId = queryDto.dealId;
    }

    if (queryDto.activityType) {
      where.activityType = queryDto.activityType;
    }

    if (queryDto.userId) {
      where.userId = queryDto.userId;
    }

    if (queryDto.direction) {
      where.direction = queryDto.direction;
    }

    if (queryDto.activityDateFrom || queryDto.activityDateTo) {
      where.activityDate = {};
      if (queryDto.activityDateFrom) {
        where.activityDate.gte = new Date(queryDto.activityDateFrom);
      }
      if (queryDto.activityDateTo) {
        where.activityDate.lte = new Date(queryDto.activityDateTo);
      }
    }

    if (queryDto.search) {
      where.OR = [
        { subject: { contains: queryDto.search, mode: 'insensitive' } },
        { description: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.CrmActivityOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'activityDate';
    const sortOrder = queryDto.sortOrder || 'desc';

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      activityDate: 'activityDate',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'activityDate';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    // Execute query
    const [activities, total] = await Promise.all([
      this.prisma.crmActivity.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
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
      this.prisma.crmActivity.count({ where }),
    ]);

    return buildPaginationResponse(activities, total, page, limit);
  }

  async findOne(id: string) {
    const activity = await this.prisma.crmActivity.findUnique({
      where: { id },
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
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

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async update(id: string, userId: string, data: UpdateActivityDto) {
    const activity = await this.findOne(id);

    // Verify contact exists if being updated
    if (data.contactId !== undefined && data.contactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: data.contactId },
      });
      if (!contact || contact.isDeleted) {
        throw new NotFoundException('Contact not found');
      }
    }

    // Verify company exists if being updated
    if (data.companyId !== undefined && data.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: data.companyId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    // Ensure at least one entity is still present
    const finalContactId =
      data.contactId !== undefined ? data.contactId : activity.contactId;
    const finalCompanyId =
      data.companyId !== undefined ? data.companyId : activity.companyId;
    const finalDealId =
      data.dealId !== undefined ? data.dealId : activity.dealId;

    if (!finalContactId && !finalCompanyId && !finalDealId) {
      throw new BadRequestException(
        'At least one of contactId, companyId, or dealId must be provided',
      );
    }

    return this.prisma.crmActivity.update({
      where: { id },
      data: {
        activityType: data.activityType,
        contactId: data.contactId,
        companyId: data.companyId,
        dealId: data.dealId,
        subject: data.subject,
        description: data.description,
        direction: data.direction,
        activityDate: data.activityDate
          ? new Date(data.activityDate)
          : undefined,
        durationMinutes: data.durationMinutes,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
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
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    await this.prisma.crmActivity.delete({
      where: { id },
    });

    return { message: 'Activity deleted successfully' };
  }
}
