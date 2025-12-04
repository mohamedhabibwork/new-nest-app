import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PasskeysService } from './passkeys.service';
import { AuthService } from '../auth.service';
import { RegisterOptionsDto } from './dto/register-options.dto';
import { RegisterVerifyDto } from './dto/register-verify.dto';
import { AuthenticateOptionsDto } from './dto/authenticate-options.dto';
import { AuthenticateVerifyDto } from './dto/authenticate-verify.dto';
import { PasskeyResponseDto } from './dto/passkey-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';

@ApiTags('passkeys')
@Controller('auth/passkeys')
export class PasskeysController {
  // In-memory challenge storage (use Redis in production)
  private challenges: Map<
    string,
    { challenge: string; userId: string; expiresAt: Date }
  > = new Map();

  constructor(
    private passkeysService: PasskeysService,
    private authService: AuthService,
  ) {
    // Clean up expired challenges every 5 minutes
    setInterval(
      () => {
        const now = new Date();
        for (const [key, value] of this.challenges.entries()) {
          if (value.expiresAt < now) {
            this.challenges.delete(key);
          }
        }
      },
      5 * 60 * 1000,
    );
  }

  @Post('register/options')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get registration options for passkey' })
  @ApiResponse({ status: 200, description: 'Registration options generated' })
  async getRegistrationOptions(
    @Request() req: any,
    @Body() dto: RegisterOptionsDto,
  ) {
    const userId = req.user.id;
    const result = await this.passkeysService.generateRegistrationOptions(
      userId,
      dto.deviceName,
    );

    // Store challenge (in production, use Redis with expiration)
    const challengeKey = `reg:${userId}:${Date.now()}`;
    this.challenges.set(challengeKey, {
      challenge: result.options.challenge,
      userId,
      expiresAt: new Date(Date.now() + 60000), // 1 minute expiration
    });

    return {
      ...result.options,
      challengeKey, // Return challenge key to client
    };
  }

  @Post('register/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify passkey registration' })
  @ApiResponse({
    status: 200,
    description: 'Passkey registered successfully',
    type: PasskeyResponseDto,
  })
  async verifyRegistration(
    @Request() req: any,
    @Body() dto: RegisterVerifyDto & { challengeKey?: string },
  ) {
    const userId = req.user.id;

    // Get challenge from storage
    if (!dto.challengeKey) {
      throw new Error('Challenge key is required');
    }
    const challengeData = this.challenges.get(dto.challengeKey);
    if (!challengeData || challengeData.userId !== userId) {
      throw new Error('Invalid or expired challenge');
    }
    this.challenges.delete(dto.challengeKey);

    const passkey = await this.passkeysService.verifyRegistration(
      userId,
      dto.deviceName,
      dto.response as any,
      challengeData.challenge,
    );

    return passkey;
  }

  @Post('authenticate/options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authentication options for passkey login' })
  @ApiResponse({ status: 200, description: 'Authentication options generated' })
  async getAuthenticationOptions(@Body() dto: AuthenticateOptionsDto) {
    const result = await this.passkeysService.generateAuthenticationOptions(
      dto.email,
    );

    // Store challenge (in production, use Redis with expiration)
    const challengeKey = `auth:${result.userId}:${Date.now()}`;
    this.challenges.set(challengeKey, {
      challenge: result.options.challenge,
      userId: result.userId,
      expiresAt: new Date(Date.now() + 60000), // 1 minute expiration
    });

    return {
      ...result.options,
      challengeKey, // Return challenge key to client
      userId: result.userId,
    };
  }

  @Post('authenticate/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify passkey authentication and login' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async verifyAuthentication(
    @Body() dto: AuthenticateVerifyDto & { challengeKey?: string },
  ) {
    // Get user by email
    const user = await this.passkeysService['prisma'].user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get challenge from storage
    if (!dto.challengeKey) {
      throw new Error('Challenge key is required');
    }
    const challengeData = this.challenges.get(dto.challengeKey);
    if (!challengeData || challengeData.userId !== user.id) {
      throw new Error('Invalid or expired challenge');
    }
    this.challenges.delete(dto.challengeKey);

    const result = await this.passkeysService.verifyAuthentication(
      user.id,
      dto.response as any,
      challengeData.challenge,
    );

    // Generate JWT token for the user
    const tokenResult = await this.authService.generateTokenForUser(user.id);

    return {
      ...tokenResult,
      verified: result.verified,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user passkeys' })
  @ApiResponse({
    status: 200,
    description: 'List of user passkeys',
    type: [PasskeyResponseDto],
  })
  async getUserPasskeys(@Request() req: any) {
    const userId = req.user.id;
    return this.passkeysService.getUserPasskeys(userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a passkey' })
  @ApiResponse({ status: 200, description: 'Passkey deleted successfully' })
  async deletePasskey(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.passkeysService.deletePasskey(userId, id);
  }
}
