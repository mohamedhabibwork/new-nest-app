import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateUlid } from '../../common/utils/ulid.util';
import { withUlid } from '../../common/utils/prisma-helpers';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    jti: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return await this.prisma.session.create({
      data: withUlid({
        userId,
        jti,
        expiresAt,
        ipAddress,
        userAgent,
      }),
    });
  }

  /**
   * Find session by JTI
   */
  async findByJti(jti: string) {
    return await this.prisma.session.findUnique({
      where: { jti },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });
  }

  /**
   * Check if session is valid (not revoked and not expired)
   */
  async isValidSession(jti: string): Promise<boolean> {
    const session = await this.findByJti(jti);

    if (!session) {
      return false;
    }

    // Check if revoked
    if (session.revokedAt) {
      return false;
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      return false;
    }

    // Check if user is active
    if (!session.user.isActive) {
      return false;
    }

    // Update last used timestamp
    await this.updateLastUsed(jti);

    return true;
  }

  /**
   * Revoke a session
   */
  async revokeSession(jti: string) {
    const session = await this.findByJti(jti);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return await this.prisma.session.update({
      where: { jti },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all sessions for a user (except the current one)
   */
  async revokeAllUserSessions(userId: string, exceptJti?: string) {
    const where: any = {
      userId,
      revokedAt: null,
    };

    if (exceptJti) {
      where.jti = { not: exceptJti };
    }

    return await this.prisma.session.updateMany({
      where,
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string) {
    return await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(jti: string) {
    await this.prisma.session.update({
      where: { jti },
      data: {
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Clean up expired sessions (can be called by a cron job)
   */
  async cleanupExpiredSessions() {
    return await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Delete session
   */
  async deleteSession(jti: string) {
    return await this.prisma.session.delete({
      where: { jti },
    });
  }
}
