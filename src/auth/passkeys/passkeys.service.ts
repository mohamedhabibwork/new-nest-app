import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { withUlid } from '../../common/utils/prisma-helpers';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

@Injectable()
export class PasskeysService {
  private readonly rpName: string;
  private readonly rpID: string;
  private readonly origin: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.rpName = this.configService.get<string>('APP_NAME') || 'PMS API';
    this.rpID = new URL(
      this.configService.get<string>('APP_URL') || 'http://localhost:3005',
    ).hostname;
    this.origin =
      this.configService.get<string>('APP_URL') || 'http://localhost:3005';
  }

  async generateRegistrationOptions(userId: string, deviceName: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get existing passkeys for the user
    const existingPasskeys = await this.prisma.passkey.findMany({
      where: { userId },
      select: {
        credentialId: true,
        counter: true,
      },
    });

    const opts: GenerateRegistrationOptionsOpts = {
      rpName: this.rpName,
      rpID: this.rpID,
      userID: Buffer.from(user.id),
      userName: user.email,
      userDisplayName: user.email,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: existingPasskeys.map((passkey) => ({
        id: passkey.credentialId,
        type: 'public-key' as const,
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
    };

    const options = await generateRegistrationOptions(opts);

    // Store the challenge temporarily (in production, use Redis or similar)
    // For now, we'll store it in the user's session or return it to be stored client-side
    return {
      options,
      deviceName,
    };
  }

  async verifyRegistration(
    userId: string,
    deviceName: string,
    response: RegistrationResponseJSON,
    expectedChallenge: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify the registration response
    let verification;
    try {
      const opts: VerifyRegistrationResponseOpts = {
        response,
        expectedChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        requireUserVerification: true,
      };

      verification = await verifyRegistrationResponse(opts);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Registration verification failed: ${errorMessage}`,
      );
    }

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      throw new BadRequestException('Registration verification failed');
    }

    // Save the passkey
    const passkey = await this.prisma.passkey.create({
      data: withUlid({
        userId,
        credentialId: Buffer.from(registrationInfo.credentialID).toString(
          'base64url',
        ),
        publicKey: Buffer.from(registrationInfo.credentialPublicKey).toString(
          'base64url',
        ),
        counter: BigInt(registrationInfo.counter),
        deviceName,
      }),
    });

    return passkey;
  }

  async generateAuthenticationOptions(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's passkeys
    const passkeys = await this.prisma.passkey.findMany({
      where: { userId: user.id },
      select: {
        credentialId: true,
      },
    });

    if (passkeys.length === 0) {
      throw new BadRequestException('No passkeys found for this user');
    }

    const opts: GenerateAuthenticationOptionsOpts = {
      timeout: 60000,
      allowCredentials: passkeys.map((passkey) => ({
        id: passkey.credentialId,
        type: 'public-key' as const,
      })),
      userVerification: 'preferred',
      rpID: this.rpID,
    };

    const options = await generateAuthenticationOptions(opts);

    return {
      options,
      userId: user.id,
    };
  }

  async verifyAuthentication(
    userId: string,
    response: AuthenticationResponseJSON,
    expectedChallenge: string,
  ) {
    // Get the passkey by credential ID
    // response.id is already base64url encoded
    const credentialId = response.id;
    const passkey = await this.prisma.passkey.findUnique({
      where: { credentialId },
      include: { user: true },
    });

    if (!passkey || passkey.userId !== userId) {
      throw new NotFoundException('Passkey not found');
    }

    // Verify the authentication response
    let verification;
    try {
      const opts: VerifyAuthenticationResponseOpts = {
        response,
        expectedChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        credential: {
          id: passkey.credentialId,
          publicKey: Buffer.from(passkey.publicKey, 'base64url'),
          counter: Number(passkey.counter),
        },
        requireUserVerification: true,
      };

      verification = await verifyAuthenticationResponse(opts);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Authentication verification failed: ${errorMessage}`,
      );
    }

    const { verified, authenticationInfo } = verification;

    if (!verified || !authenticationInfo) {
      throw new BadRequestException('Authentication verification failed');
    }

    // Update passkey counter and last used timestamp
    await this.prisma.passkey.update({
      where: { id: passkey.id },
      data: {
        counter: BigInt(authenticationInfo.newCounter),
        lastUsedAt: new Date(),
      },
    });

    // Update user's last login
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
      },
    });

    return {
      verified: true,
      user: passkey.user,
    };
  }

  async getUserPasskeys(userId: string) {
    return this.prisma.passkey.findMany({
      where: { userId },
      select: {
        id: true,
        deviceName: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deletePasskey(userId: string, passkeyId: string) {
    const passkey = await this.prisma.passkey.findUnique({
      where: { id: passkeyId },
    });

    if (!passkey) {
      throw new NotFoundException('Passkey not found');
    }

    if (passkey.userId !== userId) {
      throw new BadRequestException('You can only delete your own passkeys');
    }

    await this.prisma.passkey.delete({
      where: { id: passkeyId },
    });

    return { message: 'Passkey deleted successfully' };
  }
}
