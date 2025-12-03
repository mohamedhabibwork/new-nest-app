import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Tokens from 'csrf';

@Injectable()
export class CsrfService {
  private csrfProtection: Tokens;

  constructor(private configService: ConfigService) {
    this.csrfProtection = new Tokens();
  }

  generateSecret(): string {
    return this.csrfProtection.secretSync();
  }

  createToken(secret: string): string {
    return this.csrfProtection.create(secret);
  }

  verifyToken(secret: string, token: string): boolean {
    return this.csrfProtection.verify(secret, token);
  }

  getCookieOptions() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };
  }
}
