import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { CsrfService } from '../csrf.service';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private csrfService: CsrfService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if CSRF protection should be skipped for this route
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Skip CSRF for GET, HEAD, OPTIONS requests (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Get secret from cookie or generate new one
    let secret: string = (request.cookies?.['csrf-secret'] as string) || '';
    if (!secret) {
      secret = this.csrfService.generateSecret();
      response.cookie('csrf-secret', secret, this.csrfService.getCookieOptions());
    }

    // Get token from header
    const token = request.headers['x-csrf-token'] as string;

    if (!token) {
      throw new ForbiddenException('CSRF token is missing');
    }

    if (!this.csrfService.verifyToken(secret, token)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}

