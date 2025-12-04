import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import { buildPaginationResponse, normalizePaginationParams } from '../../common/utils/pagination.util';
import { CreateEmailCampaignDto } from './dto/create-campaign.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateEmailCampaignDto) {
    // Verify segment exists
    const segment = await this.prisma.contactSegment.findUnique({
      where: { id: data.segmentId },
    });

    if (!segment) {
      throw new NotFoundException('Contact segment not found');
    }

    const campaign = await this.prisma.emailCampaign.create({
      data: withUlid({
        name: data.name,
        subject: data.subject,
        emailContent: data.emailContent,
        segmentId: data.segmentId,
        status: data.status || 'draft',
        scheduledSendTime: data.scheduledSendTime,
        createdBy: userId,
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
      }),
      include: {
        segment: true,
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

    return campaign;
  }

  async findAll(page?: number, limit?: number, status?: string) {
    const { page: normalizedPage, limit: normalizedLimit } = normalizePaginationParams(page, limit);

    const where: Prisma.EmailCampaignWhereInput = {};
    if (status) {
      where.status = status;
    }

    const skip = (normalizedPage - 1) * normalizedLimit;

    const [campaigns, total] = await Promise.all([
      this.prisma.emailCampaign.findMany({
        where,
        include: {
          segment: {
            select: {
              id: true,
              name: true,
              contactCount: true,
            },
          },
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              emailSends: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: normalizedLimit,
      }),
      this.prisma.emailCampaign.count({ where }),
    ]);

    return buildPaginationResponse(campaigns, total, normalizedPage, normalizedLimit);
  }

  async findOne(id: string) {
    const campaign = await this.prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        segment: true,
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        emailSends: {
          take: 100,
          orderBy: { sentAt: 'desc' },
          include: {
            contact: {
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
            emailSends: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Email campaign not found');
    }

    return campaign;
  }

  async update(id: string, userId: string, data: Partial<CreateEmailCampaignDto>) {
    await this.findOne(id);

    return this.prisma.emailCampaign.update({
      where: { id },
      data: {
        name: data.name,
        subject: data.subject,
        emailContent: data.emailContent,
        segmentId: data.segmentId,
        status: data.status,
        scheduledSendTime: data.scheduledSendTime,
      },
      include: {
        segment: true,
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
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.emailCampaign.delete({
      where: { id },
    });

    return { message: 'Email campaign deleted successfully' };
  }

  async recordEmailEvent(
    emailSendId: string,
    eventType: string,
    eventData?: Record<string, unknown>,
  ) {
    const emailSend = await this.prisma.emailSend.findUnique({
      where: { id: emailSendId },
      include: {
        campaign: true,
      },
    });

    if (!emailSend) {
      throw new NotFoundException('Email send not found');
    }

    // Create event
    await this.prisma.emailEvent.create({
      data: withUlid({
        emailSendId,
        eventType,
        eventTime: new Date(),
        eventData,
      }),
    });

    // Update email send status and timestamps
    const updateData: any = {};
    if (eventType === 'sent' && !emailSend.sentAt) {
      updateData.sentAt = new Date();
      updateData.status = 'sent';
    }
    if (eventType === 'delivered' && !emailSend.deliveredAt) {
      updateData.deliveredAt = new Date();
      updateData.status = 'delivered';
    }
    if (eventType === 'opened' && !emailSend.openedAt) {
      updateData.openedAt = new Date();
    }
    if (eventType === 'clicked' && !emailSend.clickedAt) {
      updateData.clickedAt = new Date();
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.emailSend.update({
        where: { id: emailSendId },
        data: updateData,
      });
    }

    // Update campaign metrics
    const campaignUpdate: any = {};
    if (eventType === 'sent') {
      campaignUpdate.totalSent = { increment: 1 };
    }
    if (eventType === 'opened') {
      campaignUpdate.totalOpened = { increment: 1 };
    }
    if (eventType === 'clicked') {
      campaignUpdate.totalClicked = { increment: 1 };
    }

    if (Object.keys(campaignUpdate).length > 0) {
      await this.prisma.emailCampaign.update({
        where: { id: emailSend.campaignId },
        data: campaignUpdate,
      });
    }

    return { message: 'Email event recorded successfully' };
  }
}

