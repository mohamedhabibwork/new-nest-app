import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { EmailService } from '../../auth/services/email.service';

export interface EmailJob {
  type: 'verification' | 'password-reset';
  email: string;
  token: string;
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
        await this.emailService.sendVerificationEmail(email, token);
      } else if (type === 'password-reset') {
        await this.emailService.sendPasswordResetEmail(email, token);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
