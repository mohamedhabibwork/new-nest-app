import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth/optional-jwt-auth.guard';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import {
  Verify2FASetupDto,
  Disable2FADto,
  GetBackupCodesDto,
} from './dto/two-factor.dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @ApiOperation({
    summary:
      'Resend email verification (optional auth - works with or without token)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Verification email sent (if email not verified)',
    schema: {
      example: {
        message:
          'If the email exists and is not verified, a verification email has been sent.',
      },
    },
  })
  @UseGuards(OptionalJwtAuthGuard)
  @Post('resend-verification')
  async resendVerification(
    @Request() req: { user?: { id: string; email?: string } },
    @Body() resendVerificationDto?: ResendVerificationDto,
  ) {
    // If user is authenticated, use their email
    if (req.user?.id) {
      const user = await this.authService.getProfile(req.user.id);
      return this.authService.resendVerificationEmail(user.email);
    }

    // If not authenticated, require email in body
    if (!resendVerificationDto?.email) {
      throw new BadRequestException(
        'Email is required when not authenticated. Provide email in request body or include a valid JWT token.',
      );
    }

    return this.authService.resendVerificationEmail(
      resendVerificationDto.email,
    );
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
  async revokeAllSessions(
    @Request() req: { user: { id: string; jti?: string } },
  ) {
    return this.authService.revokeAllSessions(req.user.id, req.user.jti);
  }

  // 2FA Endpoints
  @ApiOperation({ summary: 'Enable 2FA (step 1: get QR code)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: '2FA setup initiated, QR code and backup codes returned',
    schema: {
      example: {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,...',
        backupCodes: ['12345678', '87654321'],
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA already enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2FA(@Request() req: { user: { id: string } }) {
    return this.authService.enable2FA(req.user.id);
  }

  @ApiOperation({ summary: 'Verify 2FA setup (step 2: verify token)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: '2FA enabled successfully',
    schema: {
      example: {
        message: '2FA enabled successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid token or setup not initiated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify-setup')
  async verify2FASetup(
    @Request() req: { user: { id: string } },
    @Body() dto: Verify2FASetupDto,
  ) {
    return this.authService.verify2FASetup(req.user.id, dto.token);
  }

  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: '2FA disabled successfully',
    schema: {
      example: {
        message: '2FA disabled successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA is not enabled' })
  @ApiResponse({ status: 401, description: 'Invalid password or unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disable2FA(
    @Request() req: { user: { id: string } },
    @Body() dto: Disable2FADto,
  ) {
    return this.authService.disable2FA(req.user.id, dto.password);
  }

  @ApiOperation({ summary: 'Send 2FA email code' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: '2FA code sent to email',
    schema: {
      example: {
        message: '2FA code sent to email',
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA is not enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/send-email-code')
  async sendEmailCode(@Request() req: { user: { id: string } }) {
    return this.authService.sendEmailCode(req.user.id);
  }

  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Backup codes regenerated successfully',
    schema: {
      example: {
        backupCodes: ['12345678', '87654321', '11223344'],
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA is not enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/regenerate-backup-codes')
  async regenerateBackupCodes(@Request() req: { user: { id: string } }) {
    return this.authService.regenerateBackupCodes(req.user.id);
  }

  @ApiOperation({ summary: 'Get backup codes info' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Backup codes information',
    schema: {
      example: {
        hasBackupCodes: true,
        count: 8,
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA is not enabled' })
  @ApiResponse({ status: 401, description: 'Invalid password or unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/backup-codes')
  async getBackupCodes(
    @Request() req: { user: { id: string } },
    @Body() dto: GetBackupCodesDto,
  ) {
    return this.authService.getBackupCodes(req.user.id, dto.password);
  }
}
