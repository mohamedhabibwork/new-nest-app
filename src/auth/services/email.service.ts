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
}
