import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import { buildPaginationResponse, normalizePaginationParams } from '../../common/utils/pagination.util';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealQueryDto } from './dto/deal-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateDealDto) {
    // Verify pipeline exists
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: data.pipelineId },
      include: { stages: true },
    });

    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }

    // Verify stage exists and belongs to pipeline
    const stage = pipeline.stages.find((s) => s.id === data.stageId);
    if (!stage) {
      throw new NotFoundException('Pipeline stage not found or does not belong to this pipeline');
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

    // If ownerId is provided, verify it exists
    if (data.ownerId) {
      const owner = await this.prisma.user.findUnique({
        where: { id: data.ownerId },
      });
      if (!owner) {
        throw new NotFoundException('Owner user not found');
      }
    }

    // Use stage's default probability if not provided
    const probability = data.probability !== undefined ? data.probability : stage.defaultProbability;

    const deal = await this.prisma.deal.create({
      data: withUlid({
        dealName: data.dealName,
        contactId: data.contactId,
        companyId: data.companyId,
        pipelineId: data.pipelineId,
        stageId: data.stageId,
        amount: data.amount,
        currency: data.currency || 'USD',
        closeDate: data.closeDate,
        probability,
        status: data.status || 'open',
        ownerId: data.ownerId || userId,
        customProperties: data.customProperties,
        notes: data.notes,
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
        pipeline: true,
        stage: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return deal;
  }

  async findAll(queryDto: DealQueryDto) {
    const { page, limit } = normalizePaginationParams(queryDto.page, queryDto.limit);

    // Build where clause
    const where: Prisma.DealWhereInput = {};

    if (queryDto.contactId) {
      where.contactId = queryDto.contactId;
    }

    if (queryDto.companyId) {
      where.companyId = queryDto.companyId;
    }

    if (queryDto.pipelineId) {
      where.pipelineId = queryDto.pipelineId;
    }

    if (queryDto.stageId) {
      where.stageId = queryDto.stageId;
    }

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.ownerId) {
      where.ownerId = queryDto.ownerId;
    }

    if (queryDto.closeDateFrom || queryDto.closeDateTo) {
      where.closeDate = {};
      if (queryDto.closeDateFrom) {
        where.closeDate.gte = new Date(queryDto.closeDateFrom);
      }
      if (queryDto.closeDateTo) {
        where.closeDate.lte = new Date(queryDto.closeDateTo);
      }
    }

    if (queryDto.search) {
      where.OR = [
        { dealName: { contains: queryDto.search, mode: 'insensitive' } },
        { notes: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.DealOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      closeDate: 'closeDate',
      amount: 'amount',
      probability: 'probability',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'createdAt';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    // Execute query
    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
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
          pipeline: {
            select: {
              id: true,
              name: true,
            },
          },
          stage: {
            select: {
              id: true,
              name: true,
              defaultProbability: true,
            },
          },
          owner: {
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
      this.prisma.deal.count({ where }),
    ]);

    return buildPaginationResponse(deals, total, page, limit);
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
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
        pipeline: true,
        stage: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        dealProducts: {
          include: {
            product: true,
          },
        },
        activities: {
          take: 10,
          orderBy: { activityDate: 'desc' },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async update(id: string, userId: string, data: UpdateDealDto) {
    const deal = await this.findOne(id);

    // If stageId is being updated, verify it exists and belongs to the pipeline
    if (data.stageId && data.stageId !== deal.stageId) {
      const stage = await this.prisma.pipelineStage.findUnique({
        where: { id: data.stageId },
      });
      if (!stage) {
        throw new NotFoundException('Pipeline stage not found');
      }
      if (stage.pipelineId !== deal.pipelineId) {
        throw new BadRequestException('Stage does not belong to this pipeline');
      }

      // If moving to closed won/lost stage, update status
      if (stage.isClosedWon) {
        data.status = 'won';
      } else if (stage.isClosedLost) {
        data.status = 'lost';
      }

      // Use stage's default probability if probability not explicitly set
      if (data.probability === undefined) {
        data.probability = stage.defaultProbability;
      }
    }

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

    // If ownerId is being updated, verify it exists
    if (data.ownerId !== undefined) {
      if (data.ownerId) {
        const owner = await this.prisma.user.findUnique({
          where: { id: data.ownerId },
        });
        if (!owner) {
          throw new NotFoundException('Owner user not found');
        }
      }
    }

    return this.prisma.deal.update({
      where: { id },
      data: {
        dealName: data.dealName,
        contactId: data.contactId,
        companyId: data.companyId,
        stageId: data.stageId,
        amount: data.amount,
        currency: data.currency,
        closeDate: data.closeDate,
        probability: data.probability,
        status: data.status,
        ownerId: data.ownerId,
        customProperties: data.customProperties,
        notes: data.notes,
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
        pipeline: true,
        stage: true,
        owner: {
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

    await this.prisma.deal.delete({
      where: { id },
    });

    return { message: 'Deal deleted successfully' };
  }

  async moveToStage(dealId: string, stageId: string, userId: string) {
    const deal = await this.findOne(dealId);

    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id: stageId },
    });

    if (!stage) {
      throw new NotFoundException('Pipeline stage not found');
    }

    if (stage.pipelineId !== deal.pipelineId) {
      throw new BadRequestException('Stage does not belong to this pipeline');
    }

    let status = deal.status;
    if (stage.isClosedWon) {
      status = 'won';
    } else if (stage.isClosedLost) {
      status = 'lost';
    } else if (deal.status === 'won' || deal.status === 'lost') {
      status = 'open';
    }

    return this.prisma.deal.update({
      where: { id: dealId },
      data: {
        stageId,
        probability: stage.defaultProbability,
        status,
      },
      include: {
        stage: true,
      },
    });
  }
}

