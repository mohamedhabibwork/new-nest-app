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
import { generateTicketNumber } from './utils/ticket-number.util';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { Prisma } from '@prisma/client';
import { NotificationEventsService } from '../../pms/notifications/notification-events.service';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private notificationEvents: NotificationEventsService,
  ) {}

  async create(userId: string, data: CreateTicketDto) {
    // Verify contact exists
    const contact = await this.prisma.contact.findUnique({
      where: { id: data.contactId },
    });

    if (!contact || contact.isDeleted) {
      throw new NotFoundException('Contact not found');
    }

    // If assignedTo is provided, verify user exists
    if (data.assignedTo) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: data.assignedTo },
      });
      if (!assignee) {
        throw new NotFoundException('Assignee user not found');
      }
    }

    // Generate ticket number
    const ticketNumber = await generateTicketNumber(this.prisma);

    const ticket = await this.prisma.ticket.create({
      data: withUlid({
        ticketNumber,
        subject: data.subject,
        description: data.description,
        contactId: data.contactId,
        assignedTo: data.assignedTo,
        status: data.status || 'new',
        priority: data.priority || 'normal',
        category: data.category,
        customProperties: data.customProperties as Prisma.InputJsonValue,
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
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify if ticket was assigned
    if (ticket.assignedTo) {
      await this.notificationEvents.notifyTicketCreated(
        ticket.id,
        ticket.ticketNumber,
        userId,
        data.contactId,
        ticket.assignedTo,
      );
    }

    return ticket;
  }

  async findAll(queryDto: TicketQueryDto) {
    const { page, limit } = normalizePaginationParams(
      queryDto.page,
      queryDto.limit,
    );

    const where: Prisma.TicketWhereInput = {};

    if (queryDto.contactId) {
      where.contactId = queryDto.contactId;
    }

    if (queryDto.assignedTo) {
      where.assignedTo = queryDto.assignedTo;
    }

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.priority) {
      where.priority = queryDto.priority;
    }

    if (queryDto.category) {
      where.category = queryDto.category;
    }

    if (queryDto.search) {
      where.OR = [
        { subject: { contains: queryDto.search, mode: 'insensitive' } },
        { description: { contains: queryDto.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.TicketOrderByWithRelationInput = {};
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'desc';

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      priority: 'priority',
      status: 'status',
    };

    const prismaSortField = sortFieldMap[sortBy] || 'createdAt';
    orderBy[prismaSortField] = sortOrder;

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
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
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return buildPaginationResponse(tickets, total, page, limit);
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
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
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(id: string, userId: string, data: UpdateTicketDto) {
    const ticket = await this.findOne(id);

    // Handle status transitions and SLA tracking
    const updateData: {
      subject?: string;
      description?: string;
      status?: string;
      priority?: string;
      category?: string;
      assignedTo?: string | null;
      customProperties?: Prisma.InputJsonValue;
      resolvedAt?: Date | null;
      closedAt?: Date | null;
    } = {
      ...data,
      customProperties: data.customProperties
        ? (data.customProperties as Prisma.InputJsonValue)
        : undefined,
    };

    if (data.status) {
      const now = new Date();
      if (data.status === 'resolved' && ticket.status !== 'resolved') {
        updateData.resolvedAt = now;
      }
      if (data.status === 'closed' && ticket.status !== 'closed') {
        updateData.closedAt = now;
        if (!ticket.resolvedAt) {
          updateData.resolvedAt = now;
        }
      }
      // If moving from resolved/closed back to open/pending, clear timestamps
      if (
        (data.status === 'open' || data.status === 'pending') &&
        (ticket.status === 'resolved' || ticket.status === 'closed')
      ) {
        updateData.resolvedAt = null;
        updateData.closedAt = null;
      }
    }

    // If assignedTo is being updated, verify user exists
    if (data.assignedTo !== undefined) {
      if (data.assignedTo) {
        const assignee = await this.prisma.user.findUnique({
          where: { id: data.assignedTo },
        });
        if (!assignee) {
          throw new NotFoundException('Assignee user not found');
        }
      }
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Notify if assignment changed
    if (
      data.assignedTo !== undefined &&
      data.assignedTo &&
      data.assignedTo !== ticket.assignedTo
    ) {
      await this.notificationEvents.notifyTicketAssigned(
        updatedTicket.id,
        updatedTicket.ticketNumber,
        userId,
        data.assignedTo,
      );
    }

    // Notify if status changed
    if (data.status && data.status !== ticket.status) {
      const notifyUserIds: string[] = [];
      if (updatedTicket.assignedTo) {
        notifyUserIds.push(updatedTicket.assignedTo);
      }
      // Add contact owner if exists
      if (updatedTicket.contact) {
        // Contact doesn't have owner in schema, so we'll just notify assignee
      }
      if (notifyUserIds.length > 0) {
        await this.notificationEvents.notifyTicketStatusChanged(
          updatedTicket.id,
          updatedTicket.ticketNumber,
          data.status,
          userId,
          notifyUserIds,
        );
      }
    }

    return updatedTicket;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    await this.prisma.ticket.delete({
      where: { id },
    });

    return { message: 'Ticket deleted successfully' };
  }

  // Comment methods removed - use CollaborationModule for polymorphic comments
}
