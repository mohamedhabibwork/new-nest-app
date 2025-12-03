import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { AuthenticatedRequest } from '../types/request.types';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest & { id?: string }>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const requestId = request.id || 'unknown';
    const userId = request.user?.id || 'anonymous';

    const now = Date.now();
    this.logger.log(
      `[${requestId}] ${method} ${url} - ${ip} - ${userAgent} - User: ${userId}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log(
            `[${requestId}] ${method} ${url} ${response.statusCode} - ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `[${requestId}] ${method} ${url} - ${delay}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}

