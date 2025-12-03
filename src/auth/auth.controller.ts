import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
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

@ApiTags('auth')
@Controller('auth')
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
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: { user: any }, @Body() loginDto: LoginDto) {
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
}
