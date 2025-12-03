import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { CsrfService } from '../csrf.service';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(
    private csrfService: CsrfService,
    private configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Check if CSRF is enabled
    const csrfEnabled = this.configService.get('CSRF_ENABLED') !== 'false';
    
    if (!csrfEnabled) {
      return next();
    }

    // Exclude public endpoints from CSRF protection
    const publicPaths = [
      '/auth/register',
      '/auth/login',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/health',
      '/api',
      '/csrf/token',
    ];

    if (publicPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Skip CSRF for safe HTTP methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Get secret from cookie or generate new one
    let secret: string = (req.cookies?.['csrf-secret'] as string) || '';
    if (!secret) {
      secret = this.csrfService.generateSecret();
      res.cookie('csrf-secret', secret, this.csrfService.getCookieOptions());
    }

    // Get token from header
    const token = req.headers['x-csrf-token'] as string;

    if (!token) {
      return res.status(403).json({ 
        statusCode: 403,
        message: 'CSRF token is missing',
        error: 'Forbidden',
      });
    }

    if (!this.csrfService.verifyToken(secret, token)) {
      return res.status(403).json({ 
        statusCode: 403,
        message: 'Invalid CSRF token',
        error: 'Forbidden',
      });
    }

    next();
  }
}

