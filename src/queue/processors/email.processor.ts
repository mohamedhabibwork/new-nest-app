import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { EmailService } from '../../auth/services/email.service';

export interface EmailJob {
  type: string;
  email: string;
  token?: string;
  // Task assignment
  taskTitle?: string;
  taskId?: string;
  assignedBy?: string;
  changes?: string[];
  // Comment
  commentAuthor?: string;
  commentText?: string;
  // Project
  projectName?: string;
  projectId?: string;
  createdBy?: string;
  // Workspace invitation
  workspaceName?: string;
  inviterName?: string;
  invitationToken?: string;
  role?: string;
  // Notification
  notificationType?: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  // 2FA
  code?: string;
}

@Processor('email')
@Injectable()
export class EmailProcessor extends WorkerHost {
  constructor(private emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJob>) {
    const { type, email, token } = job.data;

    try {
      if (type === 'verification') {
        await this.emailService.sendVerificationEmail(email, token!);
      } else if (type === 'password-reset') {
        await this.emailService.sendPasswordResetEmail(email, token!);
      } else if (type === 'task-assigned') {
        await this.emailService.sendTaskAssignedEmail(
          email,
          job.data.taskTitle!,
          job.data.taskId!,
          job.data.assignedBy!,
        );
      } else if (type === 'task-updated') {
        await this.emailService.sendTaskUpdatedEmail(
          email,
          job.data.taskTitle!,
          job.data.taskId!,
          job.data.changes || [],
        );
      } else if (type === 'comment-added') {
        await this.emailService.sendCommentAddedEmail(
          email,
          job.data.taskTitle!,
          job.data.taskId!,
          job.data.commentAuthor!,
          job.data.commentText!,
        );
      } else if (type === 'project-created') {
        await this.emailService.sendProjectCreatedEmail(
          email,
          job.data.projectName!,
          job.data.projectId!,
          job.data.createdBy!,
        );
      } else if (type === 'workspace-invitation') {
        await this.emailService.sendWorkspaceInvitationEmail(
          email,
          job.data.invitationToken!,
          job.data.workspaceName!,
          job.data.inviterName!,
          job.data.role || 'team_member',
        );
      } else if (type === 'notification') {
        await this.emailService.sendNotificationEmail(
          email,
          job.data.notificationType!,
          job.data.message!,
          job.data.entityType,
          job.data.entityId,
        );
      } else if (type === '2fa-code') {
        await this.emailService.send2FACodeEmail(email, job.data.code!);
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}
