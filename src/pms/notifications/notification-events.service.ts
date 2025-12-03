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

    const assignedByName = `${assignedBy.firstName || ''} ${assignedBy.lastName || ''}`.trim() || assignedBy.email;

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

    const authorName = `${commentAuthor.firstName || ''} ${commentAuthor.lastName || ''}`.trim() || commentAuthor.email;

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

    const createdByName = `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || createdBy.email;

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

    const inviterName = `${inviter.firstName || ''} ${inviter.lastName || ''}`.trim() || inviter.email;

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

    const uploadedByName = `${uploadedBy.firstName || ''} ${uploadedBy.lastName || ''}`.trim() || uploadedBy.email;

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

    const loggedByName = `${loggedBy.firstName || ''} ${loggedBy.lastName || ''}`.trim() || loggedBy.email;

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
}

