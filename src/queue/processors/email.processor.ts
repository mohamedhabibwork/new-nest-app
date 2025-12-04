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
  assignedByName?: string;
  changes?: string[];
  // Comment
  commentAuthor?: string;
  commentText?: string;
  // Project
  projectName?: string;
  projectId?: string;
  createdBy?: string;
  createdByName?: string;
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
  // Polymorphic System
  shareableType?: string;
  shareableId?: string;
  sharedByName?: string;
  permission?: string;
  assignableType?: string;
  assignableId?: string;
  assignerName?: string;
  assigneeName?: string;
  priority?: string;
  dueDate?: Date;
  status?: string;
  mentionableType?: string;
  mentionableId?: string;
  mentionedByName?: string;
  tagName?: string;
  creatorName?: string;
  taggedByName?: string;
  taggableType?: string;
  taggableId?: string;
  // CRM
  ticketNumber?: string;
  ticketSubject?: string;
  contactName?: string;
  dealName?: string;
  dealId?: string;
  amount?: number;
  currency?: string;
  stageName?: string;
  changedByName?: string;
  formName?: string;
  formId?: string;
  submissionId?: string;
  sentCount?: number;
  campaignName?: string;
  campaignId?: string;
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
      } else if (type === 'share-created') {
        await this.emailService.sendShareCreatedEmail(
          email,
          job.data.shareableType!,
          job.data.shareableId!,
          job.data.sharedByName!,
          job.data.permission!,
        );
      } else if (type === 'assignment-created') {
        await this.emailService.sendAssignmentCreatedEmail(
          email,
          job.data.assignableType!,
          job.data.assignableId!,
          job.data.assignerName!,
          job.data.priority,
          job.data.dueDate,
        );
      } else if (type === 'assignment-status-changed') {
        await this.emailService.sendAssignmentStatusChangedEmail(
          email,
          job.data.assignableType!,
          job.data.assignableId!,
          job.data.assigneeName!,
          job.data.status!,
        );
      } else if (type === 'mentioned') {
        await this.emailService.sendMentionedEmail(
          email,
          job.data.mentionableType!,
          job.data.mentionableId!,
          job.data.mentionedByName!,
          job.data.commentText!,
        );
      } else if (type === 'tag-created') {
        await this.emailService.sendTagCreatedEmail(
          email,
          job.data.tagName!,
          job.data.creatorName!,
        );
      } else if (type === 'taggable-tagged') {
        await this.emailService.sendTaggableTaggedEmail(
          email,
          job.data.taggableType!,
          job.data.taggableId!,
          job.data.tagName!,
          job.data.taggedByName!,
        );
      } else if (type === 'ticket-created') {
        await this.emailService.sendTicketCreatedEmail(
          email,
          job.data.ticketNumber!,
          job.data.ticketSubject!,
          job.data.contactName!,
          job.data.priority,
        );
      } else if (type === 'ticket-assigned') {
        await this.emailService.sendTicketAssignedEmail(
          email,
          job.data.ticketNumber!,
          job.data.ticketSubject!,
          job.data.assignedByName || job.data.assignedBy!,
        );
      } else if (type === 'ticket-status-changed') {
        await this.emailService.sendTicketStatusChangedEmail(
          email,
          job.data.ticketNumber!,
          job.data.ticketSubject!,
          job.data.status!,
          job.data.changedByName!,
        );
      } else if (type === 'deal-created') {
        await this.emailService.sendDealCreatedEmail(
          email,
          job.data.dealName!,
          job.data.dealId!,
          job.data.amount!,
          job.data.currency || 'USD',
          job.data.createdByName || job.data.createdBy!,
        );
      } else if (type === 'deal-stage-changed') {
        await this.emailService.sendDealStageChangedEmail(
          email,
          job.data.dealName!,
          job.data.dealId!,
          job.data.stageName!,
          job.data.changedByName!,
        );
      } else if (type === 'form-submission') {
        await this.emailService.sendFormSubmissionEmail(
          email,
          job.data.formName!,
          job.data.formId!,
          job.data.submissionId!,
          job.data.contactName,
        );
      } else if (type === 'campaign-sent') {
        await this.emailService.sendCampaignSentEmail(
          email,
          job.data.campaignName!,
          job.data.campaignId!,
          job.data.sentCount!,
        );
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}
