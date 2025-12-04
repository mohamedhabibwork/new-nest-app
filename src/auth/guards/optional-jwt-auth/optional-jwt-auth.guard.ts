import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw error when no user is found
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, just return null instead of throwing
    // This allows the endpoint to work without authentication
    if (err || !user) {
      return null;
    }
    return user;
  }

  // Override canActivate to allow requests without tokens
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // If no authorization header, allow the request (user will be null)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    // If token is provided, try to authenticate
    // If it fails, still allow the request (user will be null)
    return (super.canActivate(context) as Promise<boolean>).catch(() => {
      // If authentication fails, just return true to allow the request
      // The user will be null/undefined in the request
      return true;
    });
  }
}
