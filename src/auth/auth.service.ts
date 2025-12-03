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
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

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
    const verificationToken = uuidv4();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerificationToken: verificationToken,
      },
    });

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

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

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

  async validateJwtPayload(payload: any) {
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
    const resetToken = uuidv4();
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
}
