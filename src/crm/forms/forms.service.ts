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
import { CreateFormDto } from './dto/create-form.dto';
import { CreateFormColumnDto } from './dto/create-form-column.dto';
import { Prisma } from '@prisma/client';
import { generateUlid } from '../../common/utils/ulid.util';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateFormDto) {
    // Generate public URL if form is published (status defaults to 'draft' for new forms)
    const publicUrl = null;

    const form = await this.prisma.form.create({
      data: withUlid({
        name: data.name,
        description: data.description,
        formType: data.formType,
        status: 'draft',
        settings: data.settings as Prisma.InputJsonValue,
        automationRules: data.automationRules as Prisma.InputJsonValue,
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

  async findAll(
    page?: number,
    limit?: number,
    formType?: string,
    status?: string,
  ) {
    const { page: normalizedPage, limit: normalizedLimit } =
      normalizePaginationParams(page, limit);

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

    return buildPaginationResponse(
      forms,
      total,
      normalizedPage,
      normalizedLimit,
    );
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

    // Cast JSON fields
    if (data.settings !== undefined) {
      updateData.settings = data.settings as Prisma.InputJsonValue;
    }
    if (data.automationRules !== undefined) {
      updateData.automationRules =
        data.automationRules as Prisma.InputJsonValue;
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
        validationRules: data.validationRules as Prisma.InputJsonValue,
        properties: data.properties as Prisma.InputJsonValue,
        displayOrder: data.displayOrder || 0,
        isRequired: data.isRequired || false,
        conditionalLogic: data.conditionalLogic as Prisma.InputJsonValue,
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

    const updateData: any = { ...data };
    // Remove formId from update data as it shouldn't be changed
    delete updateData.formId;

    // Cast JSON fields
    if (data.validationRules !== undefined) {
      updateData.validationRules =
        data.validationRules as Prisma.InputJsonValue;
    }
    if (data.properties !== undefined) {
      updateData.properties = data.properties as Prisma.InputJsonValue;
    }
    if (data.conditionalLogic !== undefined) {
      updateData.conditionalLogic =
        data.conditionalLogic as Prisma.InputJsonValue;
    }

    return this.prisma.formColumn.update({
      where: { id },
      data: updateData,
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
