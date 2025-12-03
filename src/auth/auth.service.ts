import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as bcrypt from 'bcrypt';
import { generateUlid } from '../common/utils/ulid.util';
import { withUlid } from '../common/utils/prisma-helpers';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SessionService } from './services/session.service';
import { TwoFactorService } from './services/two-factor.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private twoFactorService: TwoFactorService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, invitationToken } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateUlid();

    // Create user
    const user = await this.prisma.user.create({
      data: withUlid({
        email,
        password: hashedPassword,
        name,
        emailVerificationToken: verificationToken,
      }),
    });

    // Handle workspace invitation if token provided
    let workspaceId: string | null = null;
    let role: string | null = null;
    if (invitationToken) {
        try {
          const invitation = await this.prisma.workspaceInvitation.findUnique({
            where: { invitationToken },
          });

          if (invitation && invitation.status === 'pending' && invitation.email === email) {
            if (invitation.expiresAt < new Date()) {
              // Mark as expired
              await this.prisma.workspaceInvitation.update({
                where: { id: invitation.id },
                data: { status: 'expired' },
              });
            } else {
              // Accept invitation
              await this.prisma.workspaceInvitation.update({
                where: { id: invitation.id },
                data: {
                  status: 'accepted',
                  acceptedAt: new Date(),
                },
              });
              workspaceId = invitation.workspaceId;
              role = invitation.role;
            }
          }
        } catch (error) {
          // Ignore invitation errors, continue with registration
          console.error('Error processing invitation:', error);
        }
    }

    // Queue verification email
    await this.emailQueue.add('verification', {
      type: 'verification',
      email,
      token: verificationToken,
    });

    // Return user without password
    const { password: _, ...result } = user;
    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: result,
      ...(workspaceId && role
        ? {
            workspaceId,
            role,
            invitationAccepted: true,
          }
        : {}),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Check if 2FA is enabled
    if (user.is2FAEnabled) {
      // Return a temporary token that requires 2FA verification
      // This token can only be used for 2FA verification endpoint
      const tempToken = generateUlid();
      return {
        requires2FA: true,
        tempToken,
        message: '2FA verification required',
      };
    }

    // Generate JTI (JWT ID) for session tracking
    const jti = generateUlid();

    // Calculate expiration time (default 24h)
    const expiresIn = '24h';
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create session
    await this.sessionService.createSession(
      user.id,
      jti,
      expiresAt,
    );

    // Create JWT with JTI
    const payload = { sub: user.id, email: user.email, jti };
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    const { password: _, ...result } = user;

    return {
      access_token: accessToken,
      user: result,
    };
  }

  /**
   * Verify 2FA and complete login
   */
  async verify2FAAndLogin(
    email: string,
    tempToken: string,
    twoFactorToken: string,
    useEmailCode = false,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.is2FAEnabled) {
      throw new UnauthorizedException('2FA is not enabled for this user');
    }

    let isValid = false;

    if (useEmailCode) {
      // Verify email code
      isValid = await this.twoFactorService.verifyEmailCode(
        user.id,
        twoFactorToken,
      );
    } else {
      // Verify TOTP token or backup code
      isValid = await this.twoFactorService.verify2FAToken(
        user.id,
        twoFactorToken,
      );
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    // Generate JTI (JWT ID) for session tracking
    const jti = generateUlid();

    // Calculate expiration time (default 24h)
    const expiresIn = '24h';
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create session
    await this.sessionService.createSession(user.id, jti, expiresAt);

    // Create JWT with JTI
    const payload = { sub: user.id, email: user.email, jti };
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    const { password: _, ...result } = user;

    return {
      access_token: accessToken,
      user: result,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    if (!user.emailVerified) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async validateJwtPayload(payload: { sub: string; email?: string; jti?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    return {
      message: 'Email verified successfully',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = generateUlid();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiration

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Queue password reset email
    await this.emailQueue.add('password-reset', {
      type: 'password-reset',
      email,
      token: resetToken,
    });

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return {
      message: 'Password reset successfully',
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async logout(jti: string) {
    await this.sessionService.revokeSession(jti);
  }

  async getUserSessions(userId: string) {
    return this.sessionService.getUserSessions(userId);
  }

  async revokeSession(jti: string, userId: string) {
    const session = await this.sessionService.findByJti(jti);
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }
    return this.sessionService.revokeSession(jti);
  }

  async revokeAllSessions(userId: string, exceptJti?: string) {
    return this.sessionService.revokeAllUserSessions(userId, exceptJti);
  }

  // 2FA Methods
  async enable2FA(userId: string) {
    return this.twoFactorService.enable2FA(userId);
  }

  async verify2FASetup(userId: string, token: string) {
    return this.twoFactorService.verify2FASetup(userId, token);
  }

  async disable2FA(userId: string, password: string) {
    return this.twoFactorService.disable2FA(userId, password);
  }

  async sendEmailCode(userId: string) {
    return this.twoFactorService.sendEmailCode(userId);
  }

  async regenerateBackupCodes(userId: string) {
    return this.twoFactorService.regenerateBackupCodes(userId);
  }

  async getBackupCodes(userId: string, password: string) {
    return this.twoFactorService.getBackupCodes(userId, password);
  }
}
