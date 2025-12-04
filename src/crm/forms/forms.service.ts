import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import { buildPaginationResponse, normalizePaginationParams } from '../../common/utils/pagination.util';
import { CreateFormDto } from './dto/create-form.dto';
import { CreateFormColumnDto } from './dto/create-form-column.dto';
import { Prisma } from '@prisma/client';
import { generateUlid } from '../../common/utils/ulid.util';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateFormDto) {
    // Generate public URL if form is published
    const publicUrl = data.status === 'published' 
      ? `form-${generateUlid()}` 
      : null;

    const form = await this.prisma.form.create({
      data: withUlid({
        name: data.name,
        description: data.description,
        formType: data.formType,
        status: 'draft',
        settings: data.settings,
        automationRules: data.automationRules,
        publicUrl,
        createdBy: userId,
        submissionCount: 0,
      }),
      include: {
        columns: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return form;
  }

  async findAll(page?: number, limit?: number, formType?: string, status?: string) {
    const { page: normalizedPage, limit: normalizedLimit } = normalizePaginationParams(page, limit);

    const where: Prisma.FormWhereInput = {};
    if (formType) {
      where.formType = formType;
    }
    if (status) {
      where.status = status;
    }

    const skip = (normalizedPage - 1) * normalizedLimit;

    const [forms, total] = await Promise.all([
      this.prisma.form.findMany({
        where,
        include: {
          columns: {
            orderBy: { displayOrder: 'asc' },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.form.count({ where }),
    ]);

    return buildPaginationResponse(forms, total, normalizedPage, normalizedLimit);
  }

  async findOne(id: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { displayOrder: 'asc' },
          include: {
            mappedProperty: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return form;
  }

  async update(id: string, userId: string, data: Partial<CreateFormDto>) {
    await this.findOne(id);

    const updateData: any = { ...data };
    
    // Generate public URL if status is being changed to published
    if (data.status === 'published') {
      const form = await this.prisma.form.findUnique({
        where: { id },
        select: { publicUrl: true },
      });
      if (!form?.publicUrl) {
        updateData.publicUrl = `form-${generateUlid()}`;
      }
    }

    return this.prisma.form.update({
      where: { id },
      data: updateData,
      include: {
        columns: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async remove(id: string) {
    const form = await this.findOne(id);

    // Check if form has submissions
    const submissionCount = await this.prisma.submission.count({
      where: { formId: id },
    });

    if (submissionCount > 0) {
      throw new BadRequestException('Cannot delete form with submissions');
    }

    await this.prisma.form.delete({
      where: { id },
    });

    return { message: 'Form deleted successfully' };
  }

  // Form Column Methods
  async createColumn(data: CreateFormColumnDto) {
    await this.findOne(data.formId);

    // If mappedPropertyId is provided, verify it exists
    if (data.mappedPropertyId) {
      const property = await this.prisma.contactProperty.findUnique({
        where: { id: data.mappedPropertyId },
      });
      if (!property) {
        throw new NotFoundException('Contact property not found');
      }
    }

    const column = await this.prisma.formColumn.create({
      data: withUlid({
        formId: data.formId,
        fieldName: data.fieldName,
        fieldLabel: data.fieldLabel,
        dataType: data.dataType,
        mappedPropertyId: data.mappedPropertyId,
        validationRules: data.validationRules,
        properties: data.properties,
        displayOrder: data.displayOrder || 0,
        isRequired: data.isRequired || false,
        conditionalLogic: data.conditionalLogic,
        helpText: data.helpText,
        defaultValue: data.defaultValue,
      }),
      include: {
        mappedProperty: true,
      },
    });

    return column;
  }

  async updateColumn(id: string, data: Partial<CreateFormColumnDto>) {
    const column = await this.prisma.formColumn.findUnique({
      where: { id },
    });

    if (!column) {
      throw new NotFoundException('Form column not found');
    }

    return this.prisma.formColumn.update({
      where: { id },
      data,
      include: {
        mappedProperty: true,
      },
    });
  }

  async removeColumn(id: string) {
    const column = await this.prisma.formColumn.findUnique({
      where: { id },
    });

    if (!column) {
      throw new NotFoundException('Form column not found');
    }

    await this.prisma.formColumn.delete({
      where: { id },
    });

    return { message: 'Form column deleted successfully' };
  }
}

