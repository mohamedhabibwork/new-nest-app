import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST') || '127.0.0.1',
      port: parseInt(configService.get('SMTP_PORT') || '587'),
      secure: configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const apiUrl = this.configService.get('API_URL') || frontendUrl;
    // Use non-versioned URL for email links (backward compatibility)
    const verificationUrl = `${apiUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: 'Verify your email address',
      html: `
        <h2>Email Verification</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>If you did not create an account, please ignore this email.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    // Note: reset-password is POST, so this URL should point to frontend form
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendTaskAssignedEmail(
    email: string,
    taskTitle: string,
    taskId: string,
    assignedBy: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const taskUrl = `${frontendUrl}/tasks/${taskId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `Task Assigned: ${taskTitle}`,
      html: `
        <h2>New Task Assigned</h2>
        <p>You have been assigned to a new task:</p>
        <h3>${taskTitle}</h3>
        <p>Assigned by: ${assignedBy}</p>
        <p><a href="${taskUrl}">View Task</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendTaskUpdatedEmail(
    email: string,
    taskTitle: string,
    taskId: string,
    changes: string[],
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const taskUrl = `${frontendUrl}/tasks/${taskId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `Task Updated: ${taskTitle}`,
      html: `
        <h2>Task Updated</h2>
        <p>The following task has been updated:</p>
        <h3>${taskTitle}</h3>
        <p>Changes:</p>
        <ul>
          ${changes.map((change) => `<li>${change}</li>`).join('')}
        </ul>
        <p><a href="${taskUrl}">View Task</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendCommentAddedEmail(
    email: string,
    taskTitle: string,
    taskId: string,
    commentAuthor: string,
    commentText: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const taskUrl = `${frontendUrl}/tasks/${taskId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `New Comment on Task: ${taskTitle}`,
      html: `
        <h2>New Comment</h2>
        <p>A new comment has been added to the task:</p>
        <h3>${taskTitle}</h3>
        <p><strong>${commentAuthor}</strong> commented:</p>
        <p>${commentText}</p>
        <p><a href="${taskUrl}">View Task</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendProjectCreatedEmail(
    email: string,
    projectName: string,
    projectId: string,
    createdBy: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const projectUrl = `${frontendUrl}/projects/${projectId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `New Project: ${projectName}`,
      html: `
        <h2>New Project Created</h2>
        <p>A new project has been created:</p>
        <h3>${projectName}</h3>
        <p>Created by: ${createdBy}</p>
        <p><a href="${projectUrl}">View Project</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendNotificationEmail(
    email: string,
    notificationType: string,
    message: string,
    entityType?: string,
    entityId?: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    let entityUrl = frontendUrl;
    if (entityType && entityId) {
      entityUrl = `${frontendUrl}/${entityType}s/${entityId}`;
    }

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `Notification: ${notificationType}`,
      html: `
        <h2>Notification</h2>
        <p>${message}</p>
        ${entityType && entityId ? `<p><a href="${entityUrl}">View Details</a></p>` : ''}
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWorkspaceInvitationEmail(
    email: string,
    invitationToken: string,
    workspaceName: string,
    inviterName: string,
    role: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const registrationUrl = `${frontendUrl}/register?token=${invitationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Workspace Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4F46E5;">You've been invited to join ${workspaceName}</h2>
            <p>Hello,</p>
            <p><strong>${inviterName}</strong> has invited you to join the workspace <strong>${workspaceName}</strong> as a <strong>${role}</strong>.</p>
            <p>Click the button below to accept the invitation and create your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registrationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${registrationUrl}</p>
            <p style="color: #666; font-size: 12px;">This invitation will expire in 7 days.</p>
            <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM') || 'noreply@example.com',
      to: email,
      subject: `Invitation to join ${workspaceName}`,
      html,
    });
  }

  async send2FACodeEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: 'Your 2FA Verification Code',
      html: `
        <h2>2FA Verification Code</h2>
        <p>Your verification code is:</p>
        <h3 style="font-size: 24px; letter-spacing: 4px;">${code}</h3>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // ============================================
  // Polymorphic System Email Templates
  // ============================================

  async sendShareCreatedEmail(
    email: string,
    shareableType: string,
    shareableId: string,
    sharedByName: string,
    permission: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const entityUrl = `${frontendUrl}/${shareableType}s/${shareableId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `${sharedByName} shared a ${shareableType} with you`,
      html: `
        <h2>Content Shared</h2>
        <p><strong>${sharedByName}</strong> has shared a ${shareableType} with you.</p>
        <p>Permission: <strong>${permission}</strong></p>
        <p><a href="${entityUrl}">View ${shareableType}</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendAssignmentCreatedEmail(
    email: string,
    assignableType: string,
    assignableId: string,
    assignerName: string,
    priority?: string,
    dueDate?: Date,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const entityUrl = `${frontendUrl}/${assignableType}s/${assignableId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `New Assignment: ${assignableType}`,
      html: `
        <h2>New Assignment</h2>
        <p><strong>${assignerName}</strong> has assigned you a ${assignableType}.</p>
        ${priority ? `<p>Priority: <strong>${priority}</strong></p>` : ''}
        ${dueDate ? `<p>Due Date: <strong>${new Date(dueDate).toLocaleDateString()}</strong></p>` : ''}
        <p><a href="${entityUrl}">View ${assignableType}</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendAssignmentStatusChangedEmail(
    email: string,
    assignableType: string,
    assignableId: string,
    assigneeName: string,
    status: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const entityUrl = `${frontendUrl}/${assignableType}s/${assignableId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `Assignment Status Updated: ${assignableType}`,
      html: `
        <h2>Assignment Status Updated</h2>
        <p><strong>${assigneeName}</strong> has updated the assignment status to <strong>${status}</strong>.</p>
        <p><a href="${entityUrl}">View ${assignableType}</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendMentionedEmail(
    email: string,
    mentionableType: string,
    mentionableId: string,
    mentionedByName: string,
    commentText: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const entityUrl = `${frontendUrl}/${mentionableType}s/${mentionableId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `${mentionedByName} mentioned you in a ${mentionableType}`,
      html: `
        <h2>You've been mentioned</h2>
        <p><strong>${mentionedByName}</strong> mentioned you in a ${mentionableType}:</p>
        <p style="background-color: #f5f5f5; padding: 10px; border-left: 3px solid #4F46E5;">${commentText}</p>
        <p><a href="${entityUrl}">View ${mentionableType}</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendTagCreatedEmail(
    email: string,
    tagName: string,
    creatorName: string,
  ): Promise<void> {
    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `New Tag Created: ${tagName}`,
      html: `
        <h2>New Tag Created</h2>
        <p><strong>${creatorName}</strong> has created a new tag: <strong>${tagName}</strong></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendTaggableTaggedEmail(
    email: string,
    taggableType: string,
    taggableId: string,
    tagName: string,
    taggedByName: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const entityUrl = `${frontendUrl}/${taggableType}s/${taggableId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `${taggableType} tagged: ${tagName}`,
      html: `
        <h2>Content Tagged</h2>
        <p><strong>${taggedByName}</strong> has tagged a ${taggableType} with <strong>${tagName}</strong>.</p>
        <p><a href="${entityUrl}">View ${taggableType}</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // ============================================
  // CRM Email Templates
  // ============================================

  async sendTicketCreatedEmail(
    email: string,
    ticketNumber: string,
    subject: string,
    contactName: string,
    priority?: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const ticketUrl = `${frontendUrl}/tickets/${ticketNumber}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `New Ticket Created: ${ticketNumber}`,
      html: `
        <h2>New Ticket Created</h2>
        <p>A new ticket has been created:</p>
        <h3>${ticketNumber}: ${subject}</h3>
        <p>Contact: <strong>${contactName}</strong></p>
        ${priority ? `<p>Priority: <strong>${priority}</strong></p>` : ''}
        <p><a href="${ticketUrl}">View Ticket</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendTicketAssignedEmail(
    email: string,
    ticketNumber: string,
    subject: string,
    assignedByName: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const ticketUrl = `${frontendUrl}/tickets/${ticketNumber}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `Ticket Assigned: ${ticketNumber}`,
      html: `
        <h2>Ticket Assigned</h2>
        <p><strong>${assignedByName}</strong> has assigned you a ticket:</p>
        <h3>${ticketNumber}: ${subject}</h3>
        <p><a href="${ticketUrl}">View Ticket</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendTicketStatusChangedEmail(
    email: string,
    ticketNumber: string,
    subject: string,
    status: string,
    changedByName: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const ticketUrl = `${frontendUrl}/tickets/${ticketNumber}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `Ticket Status Updated: ${ticketNumber}`,
      html: `
        <h2>Ticket Status Updated</h2>
        <p>The ticket <strong>${ticketNumber}: ${subject}</strong> status has been changed to <strong>${status}</strong> by <strong>${changedByName}</strong>.</p>
        <p><a href="${ticketUrl}">View Ticket</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendDealCreatedEmail(
    email: string,
    dealName: string,
    dealId: string,
    amount: number,
    currency: string,
    createdByName: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const dealUrl = `${frontendUrl}/deals/${dealId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `New Deal Created: ${dealName}`,
      html: `
        <h2>New Deal Created</h2>
        <p><strong>${createdByName}</strong> has created a new deal:</p>
        <h3>${dealName}</h3>
        <p>Amount: <strong>${currency} ${amount.toLocaleString()}</strong></p>
        <p><a href="${dealUrl}">View Deal</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendDealStageChangedEmail(
    email: string,
    dealName: string,
    dealId: string,
    stageName: string,
    changedByName: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const dealUrl = `${frontendUrl}/deals/${dealId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `Deal Stage Updated: ${dealName}`,
      html: `
        <h2>Deal Stage Updated</h2>
        <p>The deal <strong>${dealName}</strong> has been moved to stage <strong>${stageName}</strong> by <strong>${changedByName}</strong>.</p>
        <p><a href="${dealUrl}">View Deal</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendFormSubmissionEmail(
    email: string,
    formName: string,
    formId: string,
    submissionId: string,
    contactName?: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const submissionUrl = `${frontendUrl}/forms/${formId}/submissions/${submissionId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `New Form Submission: ${formName}`,
      html: `
        <h2>New Form Submission</h2>
        <p>A new submission has been received for the form <strong>${formName}</strong>.</p>
        ${contactName ? `<p>Submitted by: <strong>${contactName}</strong></p>` : ''}
        <p><a href="${submissionUrl}">View Submission</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendCampaignSentEmail(
    email: string,
    campaignName: string,
    campaignId: string,
    sentCount: number,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const campaignUrl = `${frontendUrl}/campaigns/${campaignId}`;

    const mailOptions = {
      from:
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SMTP_USER'),
      to: email,
      subject: `Campaign Sent: ${campaignName}`,
      html: `
        <h2>Campaign Sent</h2>
        <p>The email campaign <strong>${campaignName}</strong> has been sent to <strong>${sentCount}</strong> recipients.</p>
        <p><a href="${campaignUrl}">View Campaign</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
