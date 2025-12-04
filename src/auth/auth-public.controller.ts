import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SkipCsrf } from '../csrf/decorators/skip-csrf.decorator';

@ApiTags('auth')
@Controller('auth') // Non-versioned controller for public endpoints (email links)
export class AuthPublicController {
  constructor(private readonly authService: AuthService) {}

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
}
