import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const requestId = (req as any).id || 'unknown';

    this.logger.debug(
      `[${requestId}] Incoming request: ${method} ${originalUrl} - ${ip} - ${userAgent}`,
    );

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      this.logger.debug(
        `[${requestId}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
