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
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyQueryDto } from './dto/company-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateCompanyDto) {
    // If domain is provided, check if it already exists
    if (data.domain) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { domain: data.domain },
      });
      if (existingCompany) {
        throw new BadRequestException(
          'Company with this domain already exists',
        );
      }
    }

    // If parentCompanyId is provided, verify it exists and prevent circular references
    if (data.parentCompanyId) {
      const parentCompany = await this.prisma.company.findUnique({
        where: { id: data.parentCompanyId },
      });
      if (!parentCompany) {
        throw new NotFoundException('Parent company not found');
      }
      // Prevent self-reference - this check is not needed during creation as data.id doesn't exist yet
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

    const company = await this.prisma.company.create({
      data: withUlid({
        name: data.name,
        domain: data.domain,
        industry: data.industry,
        phone: data.phone,
        city: data.city,
        state: data.state,
        country: data.country,
        employeeCount: data.employeeCount,
        annualRevenue: data.annualRevenue,
        companyType: data.companyType,
        parentCompanyId: data.parentCompanyId,
        ownerId: data.ownerId || userId,
        customProperties: data.customProperties as Prisma.InputJsonValue,
      }),
      include: {
        parentCompany: {
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
        subsidiaries: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    return company;
  }

  async findAll(queryDto: CompanyQueryDto) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );

    // Build where clause
    const where: Prisma.CompanyWhereInput = {};

    if (queryDto.parentCompanyId) {
      where.parentCompanyId = queryDto.parentCompanyId;
    }

    if (queryDto.companyType) {
      where.companyType = queryDto.companyType;
    }

    if (queryDto.ownerId) {
      where.ownerId = queryDto.ownerId;
    }

    if (queryDto.industry) {
      where.industry = queryDto.industry;
    }

    if (queryDto.search) {
      where.OR = [
        { name: { contains: queryDto.search, mode: 'insensitive' } },
        { domain: { contains: queryDto.search, mode: 'insensitive' } },
        { industry: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.CompanyOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      name: 'name',
      annualRevenue: 'annualRevenue',
      employeeCount: 'employeeCount',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'createdAt';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    // Execute query
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: {
          parentCompany: {
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
          subsidiaries: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          _count: {
            select: {
              contacts: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return buildPaginationResponse(companies, total, page, limit);
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        parentCompany: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        subsidiaries: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        contacts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
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
        _count: {
          select: {
            contacts: true,
            deals: true,
            subsidiaries: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, userId: string, data: UpdateCompanyDto) {
    const company = await this.findOne(id);

    // If domain is being updated, check for duplicates
    if (data.domain && data.domain !== company.domain) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { domain: data.domain },
      });
      if (existingCompany && existingCompany.id !== id) {
        throw new BadRequestException(
          'Company with this domain already exists',
        );
      }
    }

    // If parentCompanyId is being updated, verify it exists and prevent circular references
    if (data.parentCompanyId !== undefined) {
      if (data.parentCompanyId) {
        if (data.parentCompanyId === id) {
          throw new BadRequestException('Company cannot be its own parent');
        }
        const parentCompany = await this.prisma.company.findUnique({
          where: { id: data.parentCompanyId },
        });
        if (!parentCompany) {
          throw new NotFoundException('Parent company not found');
        }
        // Check for circular reference: ensure parent is not a descendant
        const wouldCreateCycle = await this.checkCircularReference(
          id,
          data.parentCompanyId,
        );
        if (wouldCreateCycle) {
          throw new BadRequestException(
            'This would create a circular reference in the company hierarchy',
          );
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

    return this.prisma.company.update({
      where: { id },
      data: {
        name: data.name,
        domain: data.domain,
        industry: data.industry,
        phone: data.phone,
        city: data.city,
        state: data.state,
        country: data.country,
        employeeCount: data.employeeCount,
        annualRevenue: data.annualRevenue,
        companyType: data.companyType,
        parentCompanyId: data.parentCompanyId,
        ownerId: data.ownerId,
        customProperties: data.customProperties as Prisma.InputJsonValue,
      },
      include: {
        parentCompany: {
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
        subsidiaries: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const company = await this.findOne(id);

    // Check if company has contacts or deals
    const contactCount = await this.prisma.contact.count({
      where: { companyId: id },
    });

    if (contactCount > 0) {
      throw new BadRequestException(
        'Cannot delete company with associated contacts',
      );
    }

    // Check for subsidiaries
    const subsidiaryCount = await this.prisma.company.count({
      where: { parentCompanyId: id },
    });

    if (subsidiaryCount > 0) {
      throw new BadRequestException(
        'Cannot delete company with subsidiaries. Please reassign or delete subsidiaries first.',
      );
    }

    await this.prisma.company.delete({
      where: { id },
    });

    return { message: 'Company deleted successfully' };
  }

  private async checkCircularReference(
    companyId: string,
    potentialParentId: string,
  ): Promise<boolean> {
    // Check if potentialParentId is a descendant of companyId
    const visited = new Set<string>();
    const queue = [potentialParentId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (currentId === companyId) {
        return true; // Circular reference found
      }

      if (visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);

      const company = await this.prisma.company.findUnique({
        where: { id: currentId },
        select: { parentCompanyId: true },
      });

      if (company?.parentCompanyId) {
        queue.push(company.parentCompanyId);
      }
    }

    return false;
  }
}
