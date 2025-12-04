import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import { buildPaginationResponse, normalizePaginationParams } from '../../common/utils/pagination.util';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateContactDto) {
    // Check if email already exists
    const existingContact = await this.prisma.contact.findUnique({
      where: { email: data.email },
    });

    if (existingContact && !existingContact.isDeleted) {
      throw new BadRequestException('Contact with this email already exists');
    }

    // If companyId is provided, verify it exists
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

    const contact = await this.prisma.contact.create({
      data: withUlid({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        mobile: data.mobile,
        companyId: data.companyId,
        lifecycleStage: data.lifecycleStage,
        leadStatus: data.leadStatus || 'new',
        leadSource: data.leadSource,
        ownerId: data.ownerId || userId,
        leadScore: data.leadScore || 0,
        lastContacted: data.lastContacted,
        customProperties: data.customProperties,
        tags: data.tags,
        isDeleted: false,
      }),
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
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
    });

    return contact;
  }

  async findAll(queryDto: ContactQueryDto) {
    const { page, limit } = normalizePaginationParams(queryDto.page, queryDto.limit);

    // Build where clause
    const where: Prisma.ContactWhereInput = {
      isDeleted: queryDto.includeDeleted ? undefined : false,
    };

    if (queryDto.companyId) {
      where.companyId = queryDto.companyId;
    }

    if (queryDto.lifecycleStage) {
      where.lifecycleStage = queryDto.lifecycleStage;
    }

    if (queryDto.leadStatus) {
      where.leadStatus = queryDto.leadStatus;
    }

    if (queryDto.ownerId) {
      where.ownerId = queryDto.ownerId;
    }

    if (queryDto.leadSource) {
      where.leadSource = queryDto.leadSource;
    }

    if (queryDto.minLeadScore !== undefined || queryDto.maxLeadScore !== undefined) {
      where.leadScore = {};
      if (queryDto.minLeadScore !== undefined) {
        where.leadScore.gte = queryDto.minLeadScore;
      }
      if (queryDto.maxLeadScore !== undefined) {
        where.leadScore.lte = queryDto.maxLeadScore;
      }
    }

    if (queryDto.search) {
      where.OR = [
        { email: { contains: queryDto.search, mode: 'insensitive' } },
        { firstName: { contains: queryDto.search, mode: 'insensitive' } },
        { lastName: { contains: queryDto.search, mode: 'insensitive' } },
        { phone: { contains: queryDto.search, mode: 'insensitive' } },
        { mobile: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.ContactOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      lastContacted: 'lastContacted',
      leadScore: 'leadScore',
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'createdAt';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    // Execute query
    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              domain: true,
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
      this.prisma.contact.count({ where }),
    ]);

    return buildPaginationResponse(contacts, total, page, limit);
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        activities: {
          take: 10,
          orderBy: { activityDate: 'desc' },
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
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.isDeleted) {
      throw new NotFoundException('Contact has been deleted');
    }

    return contact;
  }

  async update(id: string, userId: string, data: UpdateContactDto) {
    const contact = await this.findOne(id);

    // If companyId is being updated, verify it exists
    if (data.companyId !== undefined) {
      if (data.companyId) {
        const company = await this.prisma.company.findUnique({
          where: { id: data.companyId },
        });
        if (!company) {
          throw new NotFoundException('Company not found');
        }
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

    // If email is being updated, check for duplicates
    if (data.email && data.email !== contact.email) {
      const existingContact = await this.prisma.contact.findUnique({
        where: { email: data.email },
      });
      if (existingContact && existingContact.id !== id && !existingContact.isDeleted) {
        throw new BadRequestException('Contact with this email already exists');
      }
    }

    return this.prisma.contact.update({
      where: { id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        mobile: data.mobile,
        companyId: data.companyId,
        lifecycleStage: data.lifecycleStage,
        leadStatus: data.leadStatus,
        leadSource: data.leadSource,
        ownerId: data.ownerId,
        leadScore: data.leadScore,
        lastContacted: data.lastContacted,
        customProperties: data.customProperties,
        tags: data.tags,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
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
    });
  }

  async remove(id: string, userId: string) {
    const contact = await this.findOne(id);

    // Soft delete
    await this.prisma.contact.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Contact deleted successfully' };
  }

  async updateLeadScore(id: string, score: number) {
    if (score < 0 || score > 100) {
      throw new BadRequestException('Lead score must be between 0 and 100');
    }

    const contact = await this.findOne(id);

    return this.prisma.contact.update({
      where: { id },
      data: { leadScore: score },
    });
  }
}

