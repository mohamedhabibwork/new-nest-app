import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Verify2FALoginDto } from './dto/verify-2fa-login.dto';
import { SkipCsrf } from '../csrf/decorators/skip-csrf.decorator';

@ApiTags('auth')
@Controller({ path: 'auth', version: VERSION_NEUTRAL }) // Non-versioned controller for public endpoints (email links)
export class AuthPublicController {
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
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
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

  @ApiOperation({
    summary: 'Verify email address (non-versioned for email links)',
  })
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

  @ApiOperation({ summary: 'Resend email verification (for guests)' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent (if email exists and not verified)',
    schema: {
      example: {
        message:
          'If the email exists and is not verified, a verification email has been sent.',
      },
    },
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @SkipCsrf() // Public endpoint - skip CSRF protection
  @Post('resend-verification')
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return this.authService.resendVerificationEmail(
      resendVerificationDto.email,
    );
  }

  @ApiOperation({ summary: 'Verify 2FA and complete login' })
  @ApiResponse({
    status: 200,
    description: '2FA verified and login completed successfully',
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
    description: 'Invalid 2FA token or temp token',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @SkipCsrf() // Public endpoint - skip CSRF protection
  @Post('verify-2fa-login')
  @HttpCode(HttpStatus.OK)
  async verify2FALogin(@Body() verify2FALoginDto: Verify2FALoginDto) {
    return this.authService.verify2FAAndLogin(
      verify2FALoginDto.email,
      verify2FALoginDto.tempToken,
      verify2FALoginDto.twoFactorToken,
      verify2FALoginDto.useEmailCode || false,
    );
  }
}
