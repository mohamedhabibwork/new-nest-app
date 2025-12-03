import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Version,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/types/request.types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { SkipCsrf } from '../csrf/decorators/skip-csrf.decorator';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        message:
          'Registration successful. Please check your email to verify your account.',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: 'John Doe',
          emailVerified: false,
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @SkipCsrf() // Public endpoint - skip CSRF protection
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        access_token: 'jwt-token-here',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          name: 'John Doe',
          emailVerified: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @SkipCsrf() // Public endpoint - skip CSRF protection
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: AuthenticatedRequest, @Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email exists)',
    schema: {
      example: {
        message: 'If the email exists, a password reset link has been sent.',
      },
    },
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @SkipCsrf() // Public endpoint - skip CSRF protection
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
    schema: {
      example: {
        message: 'Password reset successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @SkipCsrf() // Public endpoint - skip CSRF protection
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified',
    schema: {
      example: {
        message: 'Email verified successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @SkipCsrf() // Public endpoint - skip CSRF protection
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.authService.verifyEmail(token);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        name: 'John Doe',
        emailVerified: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Logout user (revoke current session)' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: { user: { jti?: string } }) {
    if (req.user.jti) {
      await this.authService.logout(req.user.jti);
    }
    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Get all active sessions for current user' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@Request() req: { user: { id: string } }) {
    return this.authService.getUserSessions(req.user.id);
  }

  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('sessions/:jti/revoke')
  async revokeSession(
    @Param('jti') jti: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.authService.revokeSession(jti, req.user.id);
  }

  @ApiOperation({ summary: 'Revoke all sessions except current' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-all')
  async revokeAllSessions(@Request() req: { user: { id: string; jti?: string } }) {
    return this.authService.revokeAllSessions(req.user.id, req.user.jti);
  }

  // 2FA Endpoints
  @ApiOperation({ summary: 'Enable 2FA (step 1: get QR code)' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2FA(@Request() req: { user: { id: string } }) {
    return this.authService.enable2FA(req.user.id);
  }

  @ApiOperation({ summary: 'Verify 2FA setup (step 2: verify token)' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify-setup')
  async verify2FASetup(
    @Request() req: { user: { id: string } },
    @Body() dto: { token: string },
  ) {
    return this.authService.verify2FASetup(req.user.id, dto.token);
  }

  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disable2FA(
    @Request() req: { user: { id: string } },
    @Body() dto: { password: string },
  ) {
    return this.authService.disable2FA(req.user.id, dto.password);
  }

  @ApiOperation({ summary: 'Send 2FA email code' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('2fa/send-email-code')
  async sendEmailCode(@Request() req: { user: { id: string } }) {
    return this.authService.sendEmailCode(req.user.id);
  }

  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('2fa/regenerate-backup-codes')
  async regenerateBackupCodes(@Request() req: { user: { id: string } }) {
    return this.authService.regenerateBackupCodes(req.user.id);
  }

  @ApiOperation({ summary: 'Get backup codes info' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('2fa/backup-codes')
  async getBackupCodes(
    @Request() req: { user: { id: string } },
    @Body() dto: { password: string },
  ) {
    return this.authService.getBackupCodes(req.user.id, dto.password);
  }
}
