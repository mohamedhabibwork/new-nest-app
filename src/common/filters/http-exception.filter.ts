import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExceptionResponseDto } from '../dto/exception-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ExceptionResponseDto = {
      statusCode: status,
      errorCode: this.getErrorCode(exception),
      message: this.getMessage(exceptionResponse),
      details: this.getDetails(exceptionResponse),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${errorResponse.message}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private getErrorCode(exception: HttpException): string {
    const status = exception.getStatus();
    const errorCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    return errorCodeMap[status] || 'HTTP_EXCEPTION';
  }

  private getMessage(exceptionResponse: any): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }
    if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
      return exceptionResponse.message;
    }
    return 'An error occurred';
  }

  private getDetails(exceptionResponse: any): any {
    if (typeof exceptionResponse === 'object' && exceptionResponse.details) {
      return exceptionResponse.details;
    }
    if (typeof exceptionResponse === 'object' && exceptionResponse.errors) {
      return exceptionResponse.errors;
    }
    return undefined;
  }
}

