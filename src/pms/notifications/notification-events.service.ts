import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationEventsService {
  constructor(
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  /**
   * Trigger notification and email for task assignment
   */
  async notifyTaskAssigned(
    taskId: string,
    assignedToUserId: string,
    assignedByUserId: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { taskTitle: true },
    });

    const assignedBy = await this.prisma.user.findUnique({
      where: { id: assignedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    const assignedTo = await this.prisma.user.findUnique({
      where: { id: assignedToUserId },
      select: { email: true },
    });

    if (!task || !assignedBy || !assignedTo) {
      return;
    }

    const assignedByName =
      `${assignedBy.firstName || ''} ${assignedBy.lastName || ''}`.trim() ||
      assignedBy.email;

    // Create notification
    await this.notificationsService.create(assignedToUserId, {
      notificationType: 'task_assigned',
      message: `You have been assigned to task: ${task.taskTitle}`,
      entityType: 'task',
      entityId: taskId,
    });

    // Send email
    await this.emailQueue.add('task-assigned', {
      type: 'task-assigned',
      email: assignedTo.email,
      taskTitle: task.taskTitle,
      taskId,
      assignedBy: assignedByName,
    });
  }

  /**
   * Trigger notification and email for task update
   */
  async notifyTaskUpdated(
    taskId: string,
    userId: string,
    changes: string[],
    notifyUserIds: string[],
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { taskTitle: true },
    });

    if (!task) {
      return;
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      if (user.id === userId) continue; // Don't notify the person who made the change

      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'task_updated',
        message: `Task "${task.taskTitle}" has been updated`,
        entityType: 'task',
        entityId: taskId,
      });

      // Send email
      await this.emailQueue.add('task-updated', {
        type: 'task-updated',
        email: user.email,
        taskTitle: task.taskTitle,
        taskId,
        changes,
      });
    }
  }

  /**
   * Trigger notification and email for comment added
   */
  async notifyCommentAdded(
    taskId: string,
    commentId: string,
    commentAuthorId: string,
    commentText: string,
    notifyUserIds: string[],
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { taskTitle: true },
    });

    const commentAuthor = await this.prisma.user.findUnique({
      where: { id: commentAuthorId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!task || !commentAuthor) {
      return;
    }

    const authorName =
      `${commentAuthor.firstName || ''} ${commentAuthor.lastName || ''}`.trim() ||
      commentAuthor.email;

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      if (user.id === commentAuthorId) continue; // Don't notify the comment author

      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'comment_added',
        message: `${authorName} commented on task: ${task.taskTitle}`,
        entityType: 'task',
        entityId: taskId,
      });

      // Send email
      await this.emailQueue.add('comment-added', {
        type: 'comment-added',
        email: user.email,
        taskTitle: task.taskTitle,
        taskId,
        commentAuthor: authorName,
        commentText,
      });
    }
  }

  /**
   * Trigger notification and email for project created
   */
  async notifyProjectCreated(
    projectId: string,
    createdByUserId: string,
    notifyUserIds: string[],
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { projectName: true },
    });

    const createdBy = await this.prisma.user.findUnique({
      where: { id: createdByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!project || !createdBy) {
      return;
    }

    const createdByName =
      `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() ||
      createdBy.email;

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'project_created',
        message: `New project "${project.projectName}" has been created`,
        entityType: 'project',
        entityId: projectId,
      });

      // Send email
      await this.emailQueue.add('project-created', {
        type: 'project-created',
        email: user.email,
        projectName: project.projectName,
        projectId,
        createdBy: createdByName,
      });
    }
  }

  /**
   * Trigger notification and email for workspace invitation
   */
  async notifyWorkspaceInvitation(
    workspaceId: string,
    invitedUserId: string,
    inviterUserId: string,
    invitationToken: string,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { workspaceName: true },
    });

    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    const invited = await this.prisma.user.findUnique({
      where: { id: invitedUserId },
      select: { email: true },
    });

    if (!workspace || !inviter || !invited) {
      return;
    }

    const inviterName =
      `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim() ||
      inviter.email;

    // Create notification
    await this.notificationsService.create(invitedUserId, {
      notificationType: 'workspace_invited',
      message: `${inviterName} invited you to join workspace: ${workspace.workspaceName}`,
      entityType: 'workspace',
      entityId: workspaceId,
    });

    // Send email
    await this.emailQueue.add('workspace-invited', {
      type: 'workspace-invited',
      email: invited.email,
      workspaceName: workspace.workspaceName,
      inviterName,
      invitationToken,
    });
  }

  /**
   * Trigger notification and email for file uploaded
   */
  async notifyFileUploaded(
    fileId: string,
    entityType: string,
    entityId: string,
    uploadedByUserId: string,
    fileName: string,
    notifyUserIds: string[],
  ) {
    const uploadedBy = await this.prisma.user.findUnique({
      where: { id: uploadedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!uploadedBy) {
      return;
    }

    const uploadedByName =
      `${uploadedBy.firstName || ''} ${uploadedBy.lastName || ''}`.trim() ||
      uploadedBy.email;

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      if (user.id === uploadedByUserId) continue; // Don't notify the uploader

      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'file_uploaded',
        message: `${uploadedByName} uploaded a file: ${fileName}`,
        entityType,
        entityId,
      });
    }
  }

  /**
   * Trigger notification and email for time logged
   */
  async notifyTimeLogged(
    timeLogId: string,
    taskId: string,
    loggedByUserId: string,
    hoursLogged: number,
    notifyUserIds: string[],
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { taskTitle: true },
    });

    const loggedBy = await this.prisma.user.findUnique({
      where: { id: loggedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!task || !loggedBy) {
      return;
    }

    const loggedByName =
      `${loggedBy.firstName || ''} ${loggedBy.lastName || ''}`.trim() ||
      loggedBy.email;

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true },
    });

    for (const user of users) {
      if (user.id === loggedByUserId) continue; // Don't notify the person who logged time

      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'time_logged',
        message: `${loggedByName} logged ${hoursLogged} hours on task: ${task.taskTitle}`,
        entityType: 'task',
        entityId: taskId,
      });
    }
  }

  /**
   * Trigger notification for share created
   */
  async notifyShareCreated(
    shareId: string,
    shareableType: string,
    shareableId: string,
    sharedByUserId: string,
    recipientUserId: string,
    permission?: string,
  ) {
    const sharedBy = await this.prisma.user.findUnique({
      where: { id: sharedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientUserId },
      select: { email: true },
    });

    if (!sharedBy || !recipient) {
      return;
    }

    const sharedByName =
      `${sharedBy.firstName || ''} ${sharedBy.lastName || ''}`.trim() ||
      sharedBy.email;

    // Create notification
    await this.notificationsService.create(recipientUserId, {
      notificationType: 'share_created',
      message: `${sharedByName} shared a ${shareableType} with you`,
      entityType: shareableType,
      entityId: shareableId,
    });

    // Send email
    await this.emailQueue.add('share-created', {
      type: 'share-created',
      email: recipient.email,
      shareableType,
      shareableId,
      sharedByName,
      permission: permission || 'view',
    });
  }

  /**
   * Trigger notification for assignment created
   */
  async notifyAssignmentCreated(
    assignmentId: string,
    assignableType: string,
    assignableId: string,
    assignerUserId: string,
    assigneeUserId: string,
    priority?: string,
    dueDate?: Date,
  ) {
    const assigner = await this.prisma.user.findUnique({
      where: { id: assignerUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeUserId },
      select: { email: true },
    });

    if (!assigner || !assignee) {
      return;
    }

    const assignerName =
      `${assigner.firstName || ''} ${assigner.lastName || ''}`.trim() ||
      assigner.email;

    // Create notification
    await this.notificationsService.create(assigneeUserId, {
      notificationType: 'assignment_created',
      message: `${assignerName} assigned you a ${assignableType}`,
      entityType: assignableType,
      entityId: assignableId,
    });

    // Send email
    await this.emailQueue.add('assignment-created', {
      type: 'assignment-created',
      email: assignee.email,
      assignableType,
      assignableId,
      assignerName,
      priority,
      dueDate,
    });
  }

  /**
   * Trigger notification for assignment status changed
   */
  async notifyAssignmentStatusChanged(
    assignmentId: string,
    assignableType: string,
    assignableId: string,
    assigneeUserId: string,
    assignerUserId: string,
    status: string,
  ) {
    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    const assigner = await this.prisma.user.findUnique({
      where: { id: assignerUserId },
      select: { email: true },
    });

    if (!assignee || !assigner) {
      return;
    }

    const assigneeName =
      `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() ||
      assignee.email;

    // Create notification
    await this.notificationsService.create(assignerUserId, {
      notificationType: 'assignment_status_changed',
      message: `${assigneeName} updated assignment status to ${status}`,
      entityType: assignableType,
      entityId: assignableId,
    });

    // Send email
    await this.emailQueue.add('assignment-status-changed', {
      type: 'assignment-status-changed',
      email: assigner.email,
      assignableType,
      assignableId,
      assigneeName,
      status,
    });
  }

  /**
   * Trigger notification for user mentioned in comment
   */
  async notifyMentioned(
    mentionId: string,
    mentionableType: string,
    mentionableId: string,
    mentionedByUserId: string,
    mentionedUserId: string,
    commentText?: string,
  ) {
    const mentionedBy = await this.prisma.user.findUnique({
      where: { id: mentionedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    const mentionedUser = await this.prisma.user.findUnique({
      where: { id: mentionedUserId },
      select: { email: true },
    });

    if (!mentionedBy || !mentionedUser) {
      return;
    }

    const mentionedByName =
      `${mentionedBy.firstName || ''} ${mentionedBy.lastName || ''}`.trim() ||
      mentionedBy.email;

    // Create notification
    await this.notificationsService.create(mentionedUserId, {
      notificationType: 'mentioned',
      message: `${mentionedByName} mentioned you in a ${mentionableType}`,
      entityType: mentionableType,
      entityId: mentionableId,
    });

    // Send email
    await this.emailQueue.add('mentioned', {
      type: 'mentioned',
      email: mentionedUser.email,
      mentionableType,
      mentionableId,
      mentionedByName,
      commentText: commentText || '',
    });
  }

  /**
   * Trigger notification for tag created
   */
  async notifyTagCreated(
    tagId: string,
    tagName: string,
    creatorUserId: string,
  ) {
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!creator) {
      return;
    }

    const creatorName =
      `${creator.firstName || ''} ${creator.lastName || ''}`.trim() ||
      creator.email;

    // Send email (optional - only if you want to notify about tag creation)
    // await this.emailQueue.add('tag-created', {
    //   type: 'tag-created',
    //   email: creator.email,
    //   tagName,
    //   creatorName,
    // });
  }

  /**
   * Trigger notification for taggable tagged
   */
  async notifyTaggableTagged(
    taggingId: string,
    tagId: string,
    taggableType: string,
    taggableId: string,
    taggedByUserId: string,
    notifyUserIds: string[],
  ) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
      select: { tagName: true },
    });

    const taggedBy = await this.prisma.user.findUnique({
      where: { id: taggedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!tag || !taggedBy) {
      return;
    }

    const taggedByName =
      `${taggedBy.firstName || ''} ${taggedBy.lastName || ''}`.trim() ||
      taggedBy.email;

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      if (user.id === taggedByUserId) continue; // Don't notify the person who tagged

      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'taggable_tagged',
        message: `${taggedByName} tagged a ${taggableType} with ${tag.tagName}`,
        entityType: taggableType,
        entityId: taggableId,
      });

      // Send email
      await this.emailQueue.add('taggable-tagged', {
        type: 'taggable-tagged',
        email: user.email,
        taggableType,
        taggableId,
        tagName: tag.tagName,
        taggedByName,
      });
    }
  }

  // ============================================
  // CRM Notification Events
  // ============================================

  /**
   * Trigger notification for ticket created
   */
  async notifyTicketCreated(
    ticketId: string,
    ticketNumber: string,
    createdByUserId: string,
    contactId: string,
    assignedToUserId?: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { subject: true, priority: true },
    });

    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
      select: { firstName: true, lastName: true, email: true },
    });

    if (!ticket || !contact) {
      return;
    }

    const contactName =
      `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
      contact.email;

    // Notify assignee if assigned
    if (assignedToUserId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: assignedToUserId },
        select: { email: true },
      });

      if (assignee) {
        // Create notification
        await this.notificationsService.create(assignedToUserId, {
          notificationType: 'ticket_created',
          message: `New ticket ${ticketNumber} has been assigned to you`,
          entityType: 'ticket',
          entityId: ticketId,
        });

        // Send email
        await this.emailQueue.add('ticket-created', {
          type: 'ticket-created',
          email: assignee.email,
          ticketNumber,
          ticketSubject: ticket.subject,
          contactName,
          priority: ticket.priority,
        });
      }
    }
  }

  /**
   * Trigger notification for ticket assigned
   */
  async notifyTicketAssigned(
    ticketId: string,
    ticketNumber: string,
    assignedByUserId: string,
    assignedToUserId: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { subject: true },
    });

    const assignedBy = await this.prisma.user.findUnique({
      where: { id: assignedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    const assignedTo = await this.prisma.user.findUnique({
      where: { id: assignedToUserId },
      select: { email: true },
    });

    if (!ticket || !assignedBy || !assignedTo) {
      return;
    }

    const assignedByName =
      `${assignedBy.firstName || ''} ${assignedBy.lastName || ''}`.trim() ||
      assignedBy.email;

    // Create notification
    await this.notificationsService.create(assignedToUserId, {
      notificationType: 'ticket_assigned',
      message: `Ticket ${ticketNumber} has been assigned to you`,
      entityType: 'ticket',
      entityId: ticketId,
    });

    // Send email
    await this.emailQueue.add('ticket-assigned', {
      type: 'ticket-assigned',
      email: assignedTo.email,
      ticketNumber,
      ticketSubject: ticket.subject,
      assignedByName,
    });
  }

  /**
   * Trigger notification for ticket status changed
   */
  async notifyTicketStatusChanged(
    ticketId: string,
    ticketNumber: string,
    status: string,
    changedByUserId: string,
    notifyUserIds: string[],
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { subject: true },
    });

    const changedBy = await this.prisma.user.findUnique({
      where: { id: changedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!ticket || !changedBy) {
      return;
    }

    const changedByName =
      `${changedBy.firstName || ''} ${changedBy.lastName || ''}`.trim() ||
      changedBy.email;

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      if (user.id === changedByUserId) continue; // Don't notify the person who made the change

      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'ticket_status_changed',
        message: `Ticket ${ticketNumber} status changed to ${status}`,
        entityType: 'ticket',
        entityId: ticketId,
      });

      // Send email
      await this.emailQueue.add('ticket-status-changed', {
        type: 'ticket-status-changed',
        email: user.email,
        ticketNumber,
        ticketSubject: ticket.subject,
        status,
        changedByName,
      });
    }
  }

  /**
   * Trigger notification for deal created
   */
  async notifyDealCreated(
    dealId: string,
    createdByUserId: string,
    notifyUserIds: string[],
  ) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      select: { dealName: true, amount: true, currency: true },
    });

    const createdBy = await this.prisma.user.findUnique({
      where: { id: createdByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!deal || !createdBy) {
      return;
    }

    const createdByName =
      `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() ||
      createdBy.email;

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      if (user.id === createdByUserId) continue; // Don't notify the creator

      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'deal_created',
        message: `New deal "${deal.dealName}" has been created`,
        entityType: 'deal',
        entityId: dealId,
      });

      // Send email
      await this.emailQueue.add('deal-created', {
        type: 'deal-created',
        email: user.email,
        dealName: deal.dealName,
        dealId,
        amount: Number(deal.amount),
        currency: deal.currency || 'USD',
        createdBy: createdByUserId,
        createdByName,
      });
    }
  }

  /**
   * Trigger notification for deal stage changed
   */
  async notifyDealStageChanged(
    dealId: string,
    stageName: string,
    changedByUserId: string,
    notifyUserIds: string[],
  ) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      select: { dealName: true },
    });

    const changedBy = await this.prisma.user.findUnique({
      where: { id: changedByUserId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!deal || !changedBy) {
      return;
    }

    const changedByName =
      `${changedBy.firstName || ''} ${changedBy.lastName || ''}`.trim() ||
      changedBy.email;

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      if (user.id === changedByUserId) continue; // Don't notify the person who made the change

      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'deal_stage_changed',
        message: `Deal "${deal.dealName}" moved to stage "${stageName}"`,
        entityType: 'deal',
        entityId: dealId,
      });

      // Send email
      await this.emailQueue.add('deal-stage-changed', {
        type: 'deal-stage-changed',
        email: user.email,
        dealName: deal.dealName,
        dealId,
        stageName,
        changedByName,
      });
    }
  }

  /**
   * Trigger notification for form submission
   */
  async notifyFormSubmission(
    submissionId: string,
    formId: string,
    contactId?: string,
    notifyUserIds: string[] = [],
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        form: {
          select: { name: true },
        },
        contact: contactId
          ? {
              select: { firstName: true, lastName: true, email: true },
            }
          : undefined,
      },
    });

    if (!submission) {
      return;
    }

    const contactName = submission.contact
      ? `${submission.contact.firstName || ''} ${submission.contact.lastName || ''}`.trim() ||
        submission.contact.email
      : undefined;

    // If no specific users to notify, notify form creator
    if (notifyUserIds.length === 0 && submission.form) {
      const form = await this.prisma.form.findUnique({
        where: { id: formId },
        select: { createdBy: true },
      });
      if (form?.createdBy) {
        notifyUserIds = [form.createdBy];
      }
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: notifyUserIds } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      // Create notification
      await this.notificationsService.create(user.id, {
        notificationType: 'form_submission',
        message: `New submission received for form "${submission.form.name}"`,
        entityType: 'form',
        entityId: formId,
      });

      // Send email
      await this.emailQueue.add('form-submission', {
        type: 'form-submission',
        email: user.email,
        formName: submission.form.name,
        formId,
        submissionId,
        contactName,
      });
    }
  }
}
