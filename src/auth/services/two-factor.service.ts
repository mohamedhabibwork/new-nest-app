import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcrypt';
import { generateUlid } from '../../common/utils/ulid.util';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  /**
   * Generate TOTP secret for user
   */
  generateSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `${this.configService.get('APP_NAME') || 'App'} (${email})`,
      length: 32,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  /**
   * Generate QR code for TOTP setup
   */
  async generateQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  /**
   * Verify TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
    });
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count = 10): string[] {
    return Array.from({ length: count }, () => {
      // Generate 8-digit backup code
      return Math.random().toString().slice(2, 10);
    });
  }

  /**
   * Hash backup codes for storage
   */
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(hashedCodes: string[], code: string): Promise<boolean> {
    for (const hashedCode of hashedCodes) {
      const isValid = await bcrypt.compare(code, hashedCode);
      if (isValid) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generate email verification code
   */
  generateEmailCode(): string {
    // Generate 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Enable 2FA for user (step 1: generate secret and QR code)
   */
  async enable2FA(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is2FAEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const { secret, otpauthUrl } = this.generateSecret(user.email);
    const qrCode = await this.generateQRCode(otpauthUrl);
    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    // Store secret and backup codes (not verified yet)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    return {
      secret,
      qrCode,
      backupCodes, // Return plain codes only once
    };
  }

  /**
   * Verify 2FA setup (step 2: verify token and enable)
   */
  async verify2FASetup(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    const isValid = this.verifyToken(user.twoFactorSecret, token);

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        is2FAEnabled: true,
        twoFactorVerifiedAt: new Date(),
      },
    });

    return { message: '2FA enabled successfully' };
  }

  /**
   * Disable 2FA (requires password)
   */
  async disable2FA(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.is2FAEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Disable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        is2FAEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null as any,
        twoFactorVerifiedAt: null,
      },
    });

    return { message: '2FA disabled successfully' };
  }

  /**
   * Verify 2FA token during login
   */
  async verify2FAToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.is2FAEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Try TOTP token first
    const isValidTotp = this.verifyToken(user.twoFactorSecret, token);
    if (isValidTotp) {
      return true;
    }

    // Try backup codes
    if (user.twoFactorBackupCodes && Array.isArray(user.twoFactorBackupCodes)) {
      const backupCodes = user.twoFactorBackupCodes as string[];
      const isValidBackup = await this.verifyBackupCode(backupCodes, token);
      if (isValidBackup) {
        // Remove used backup code
        const remainingCodes: string[] = [];
        for (const hashedCode of backupCodes) {
          const isValid = await bcrypt.compare(token, hashedCode);
          if (!isValid) {
            remainingCodes.push(hashedCode);
          }
        }
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            twoFactorBackupCodes: remainingCodes.length > 0 ? remainingCodes : null as any,
          },
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Generate and send email verification code
   */
  async sendEmailCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.is2FAEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    const code = this.generateEmailCode();
    const codeExpiry = new Date();
    codeExpiry.setMinutes(codeExpiry.getMinutes() + 10); // 10 minutes expiry

    // Store code temporarily in user metadata or use Redis in production
    // For now, we'll send it via email
    await this.emailQueue.add('2fa-code', {
      type: '2fa-code',
      email: user.email,
      code,
    });

    // In production, store code in Redis with expiry: await redis.setex(`2fa:${userId}:code`, 600, code);
    return {
      message: '2FA code sent to email',
    };
  }

  /**
   * Verify email code
   * Note: In production, implement proper code storage (Redis) and verification
   */
  async verifyEmailCode(userId: string, code: string): Promise<boolean> {
    // TODO: Implement proper code verification from Redis/DB
    // For now, this is a placeholder that always returns true
    // In production: const storedCode = await redis.get(`2fa:${userId}:code`);
    // return storedCode === code;
    return true;
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.is2FAEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: hashedBackupCodes,
      },
    });

    return { backupCodes };
  }

  /**
   * Get backup codes (requires password)
   */
  async getBackupCodes(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.is2FAEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Return backup codes (only if they exist)
    // Note: We can't return plain codes once they're hashed
    // This endpoint is mainly for checking if codes exist
    return {
      hasBackupCodes: !!user.twoFactorBackupCodes,
      count: user.twoFactorBackupCodes
        ? (user.twoFactorBackupCodes as string[]).length
        : 0,
    };
  }
}

