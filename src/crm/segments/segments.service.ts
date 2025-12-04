import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid, withUlidArray } from '../../common/utils/prisma-helpers';
import { CreateSegmentDto, SegmentCriteriaDto } from './dto/create-segment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SegmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSegmentDto) {
    const segment = await this.prisma.contactSegment.create({
      data: withUlid({
        name: data.name,
        description: data.description,
        segmentType: data.segmentType,
        contactCount: 0,
      }),
    });

    // Create criteria if provided
    if (data.criteria && data.criteria.length > 0) {
      await Promise.all(
        data.criteria.map((criterion, index) =>
          this.prisma.segmentCriteria.create({
            data: withUlid({
              segmentId: segment.id,
              propertyName: criterion.propertyName,
              operator: criterion.operator,
              value: criterion.value,
              logic: criterion.logic || (index === 0 ? 'and' : 'and'),
            }),
          }),
        ),
      );
    }

    // Calculate contact count for dynamic segments
    if (data.segmentType === 'dynamic') {
      const count = await this.calculateContactCount(segment.id);
      await this.prisma.contactSegment.update({
        where: { id: segment.id },
        data: { contactCount: count },
      });
    }

    return this.findOne(segment.id);
  }

  async findAll() {
    return this.prisma.contactSegment.findMany({
      include: {
        criteria: {
          orderBy: { id: 'asc' },
        },
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const segment = await this.prisma.contactSegment.findUnique({
      where: { id },
      include: {
        criteria: {
          orderBy: { id: 'asc' },
        },
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
    });

    if (!segment) {
      throw new NotFoundException('Contact segment not found');
    }

    return segment;
  }

  async update(id: string, data: Partial<CreateSegmentDto>) {
    await this.findOne(id);

    const segment = await this.prisma.contactSegment.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        segmentType: data.segmentType,
      },
    });

    // Update criteria if provided
    if (data.criteria) {
      // Delete existing criteria
      await this.prisma.segmentCriteria.deleteMany({
        where: { segmentId: id },
      });

      // Create new criteria
      if (data.criteria.length > 0) {
        await Promise.all(
          data.criteria.map((criterion, index) =>
            this.prisma.segmentCriteria.create({
              data: withUlid({
                segmentId: id,
                propertyName: criterion.propertyName,
                operator: criterion.operator,
                value: criterion.value,
                logic: criterion.logic || (index === 0 ? 'and' : 'and'),
              }),
            }),
          ),
        );
      }

      // Recalculate contact count for dynamic segments
      if (data.segmentType === 'dynamic') {
        const count = await this.calculateContactCount(id);
        await this.prisma.contactSegment.update({
          where: { id },
          data: { contactCount: count },
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.contactSegment.delete({
      where: { id },
    });

    return { message: 'Contact segment deleted successfully' };
  }

  async getContacts(id: string, page?: number, limit?: number) {
    const segment = await this.findOne(id);

    if (segment.segmentType === 'static') {
      // Static segments would have manually added contacts (not implemented in this version)
      return { data: [], total: 0, page: 1, limit: 50 };
    }

    // Dynamic segment: build query from criteria
    const where = this.buildContactWhereFromCriteria(segment.criteria);

    const skip = page && limit ? (page - 1) * limit : 0;
    const take = limit || 50;

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data: contacts,
      total,
      page: page || 1,
      limit: limit || 50,
    };
  }

  private async calculateContactCount(segmentId: string): Promise<number> {
    const segment = await this.prisma.contactSegment.findUnique({
      where: { id: segmentId },
      include: { criteria: true },
    });

    if (!segment || segment.segmentType === 'static') {
      return 0;
    }

    const where = this.buildContactWhereFromCriteria(segment.criteria);
    return this.prisma.contact.count({ where });
  }

  private buildContactWhereFromCriteria(
    criteria: Array<{
      propertyName: string;
      operator: string;
      value: string | null;
      logic?: string | null;
    }>,
  ): Prisma.ContactWhereInput {
    if (!criteria || criteria.length === 0) {
      return {};
    }

    const conditions: Prisma.ContactWhereInput[] = [];

    for (const criterion of criteria) {
      let condition: Prisma.ContactWhereInput = {};

      switch (criterion.operator) {
        case 'equals':
          condition = { [criterion.propertyName]: criterion.value };
          break;
        case 'not_equals':
          condition = { [criterion.propertyName]: { not: criterion.value } };
          break;
        case 'contains':
          condition = {
            [criterion.propertyName]: {
              contains: criterion.value,
              mode: 'insensitive',
            },
          };
          break;
        case 'greater_than':
          condition = {
            [criterion.propertyName]: { gt: criterion.value },
          };
          break;
        case 'less_than':
          condition = {
            [criterion.propertyName]: { lt: criterion.value },
          };
          break;
        case 'is_empty':
          condition = {
            OR: [
              { [criterion.propertyName]: null },
              { [criterion.propertyName]: '' },
            ],
          };
          break;
        case 'is_not_empty':
          condition = {
            AND: [
              { [criterion.propertyName]: { not: null } },
              { [criterion.propertyName]: { not: '' } },
            ],
          };
          break;
      }

      if (Object.keys(condition).length > 0) {
        conditions.push(condition);
      }
    }

    // Combine conditions with AND logic (simplified - full implementation would handle OR logic)
    return {
      AND: conditions,
    };
  }
}

