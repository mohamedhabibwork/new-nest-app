import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(configService.get('SMTP_PORT') || '587'),
      secure: configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
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
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
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
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const taskUrl = `${frontendUrl}/tasks/${taskId}`;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
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
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const taskUrl = `${frontendUrl}/tasks/${taskId}`;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
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
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const taskUrl = `${frontendUrl}/tasks/${taskId}`;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
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
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const projectUrl = `${frontendUrl}/projects/${projectId}`;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
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
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    let entityUrl = frontendUrl;
    if (entityType && entityId) {
      entityUrl = `${frontendUrl}/${entityType}s/${entityId}`;
    }

    const mailOptions = {
      from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
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
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
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
      from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
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
}
