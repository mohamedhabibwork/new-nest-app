import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid, withUlidArray } from '../../common/utils/prisma-helpers';
import { buildPaginationResponse, normalizePaginationParams } from '../../common/utils/pagination.util';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { Prisma } from '@prisma/client';
import { ContactsService } from '../contacts/contacts.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private contactsService: ContactsService,
  ) {}

  async create(data: CreateSubmissionDto) {
    // Verify form exists and is published
    const form = await this.prisma.form.findUnique({
      where: { id: data.formId },
      include: {
        columns: {
          orderBy: { displayOrder: 'asc' },
          include: {
            mappedProperty: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== 'published') {
      throw new NotFoundException('Form is not published');
    }

    // Find or create contact based on email
    let contact = await this.prisma.contact.findUnique({
      where: { email: data.submitterEmail },
    });

    if (!contact || contact.isDeleted) {
      // Create new contact
      contact = await this.prisma.contact.create({
        data: withUlid({
          email: data.submitterEmail,
          leadSource: 'form',
          leadStatus: 'new',
          isDeleted: false,
        }),
      });
    }

    // Create submission
    const submission = await this.prisma.submission.create({
      data: withUlid({
        formId: data.formId,
        contactId: contact.id,
        submitterEmail: data.submitterEmail,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        utmParameters: data.utmParameters,
        referrerUrl: data.referrerUrl,
        processingStatus: 'pending',
        isDuplicate: false,
        metadata: data.metadata,
      }),
    });

    // Create submission values
    const submissionValues = await Promise.all(
      data.values.map((value) =>
        this.prisma.submissionValue.create({
          data: withUlid({
            submissionId: submission.id,
            formColumnId: value.formColumnId,
            valueType: value.valueType,
            valueText: value.valueText,
            valueNumber: value.valueNumber,
            valueBoolean: value.valueBoolean,
            valueDate: value.valueDate ? new Date(value.valueDate) : undefined,
            valueJson: value.valueJson,
            valueArray: value.valueArray,
            fileMetadata: value.fileMetadata,
          }),
        }),
      ),
    );

    // Process submission: update contact based on mapped properties
    await this.processSubmission(submission.id, form.id, contact.id);

    // Update form submission count
    await this.prisma.form.update({
      where: { id: data.formId },
      data: {
        submissionCount: {
          increment: 1,
        },
      },
    });

    return {
      ...submission,
      values: submissionValues,
      contact,
    };
  }

  private async processSubmission(
    submissionId: string,
    formId: string,
    contactId: string,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        values: {
          include: {
            formColumn: {
              include: {
                mappedProperty: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return;
    }

    const updateData: any = {};

    // Process each submission value and map to contact properties
    for (const value of submission.values) {
      if (value.formColumn.mappedProperty) {
        const property = value.formColumn.mappedProperty;
        const propertyName = property.propertyName;

        // Map value based on data type
        let mappedValue: any;
        switch (value.valueType) {
          case 'text':
            mappedValue = value.valueText;
            break;
          case 'number':
            mappedValue = value.valueNumber;
            break;
          case 'boolean':
            mappedValue = value.valueBoolean;
            break;
          case 'date':
            mappedValue = value.valueDate;
            break;
          default:
            mappedValue = value.valueText;
        }

        // Map to contact fields
        if (propertyName === 'email') {
          updateData.email = mappedValue;
        } else if (propertyName === 'firstName' || propertyName === 'first_name') {
          updateData.firstName = mappedValue;
        } else if (propertyName === 'lastName' || propertyName === 'last_name') {
          updateData.lastName = mappedValue;
        } else if (propertyName === 'phone') {
          updateData.phone = mappedValue;
        } else {
          // Store in custom properties
          if (!updateData.customProperties) {
            updateData.customProperties = {};
          }
          updateData.customProperties[propertyName] = mappedValue;
        }
      }
    }

    // Update contact if there's data to update
    if (Object.keys(updateData).length > 0) {
      await this.prisma.contact.update({
        where: { id: contactId },
        data: updateData,
      });
    }

    // Mark submission as processed
    await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        processingStatus: 'processed',
        processedAt: new Date(),
      },
    });
  }

  async findAll(page?: number, limit?: number, formId?: string, contactId?: string) {
    const { page: normalizedPage, limit: normalizedLimit } = normalizePaginationParams(page, limit);

    const where: Prisma.SubmissionWhereInput = {};
    if (formId) {
      where.formId = formId;
    }
    if (contactId) {
      where.contactId = contactId;
    }

    const skip = (normalizedPage - 1) * normalizedLimit;

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        include: {
          form: {
            select: {
              id: true,
              name: true,
              formType: true,
            },
          },
          contact: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.submission.count({ where }),
    ]);

    return buildPaginationResponse(submissions, total, normalizedPage, normalizedLimit);
  }

  async findOne(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        form: true,
        contact: true,
        values: {
          include: {
            formColumn: {
              include: {
                mappedProperty: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }
}

