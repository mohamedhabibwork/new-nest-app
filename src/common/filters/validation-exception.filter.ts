import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';
import { ExceptionResponseDto } from '../dto/exception-response.dto';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionResponse = exception.getResponse();

    // Check if this is a validation error
    if (
      typeof exceptionResponse === 'object' &&
      (exceptionResponse as any).message &&
      Array.isArray((exceptionResponse as any).message)
    ) {
      const validationErrors = this.formatValidationErrors(
        (exceptionResponse as any).message,
      );

      const errorResponse: ExceptionResponseDto = {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: validationErrors,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      this.logger.warn(
        `${request.method} ${request.url} - Validation failed`,
        JSON.stringify(validationErrors),
      );

      return response.status(400).json(errorResponse);
    }

    // If not a validation error, let it pass through
    throw exception;
  }

  private formatValidationErrors(
    errors: string[] | ValidationError[],
  ): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    if (Array.isArray(errors) && errors.length > 0) {
      // Check if it's an array of ValidationError objects
      if (typeof errors[0] === 'object' && 'property' in errors[0]) {
        (errors as ValidationError[]).forEach((error) => {
          formatted[error.property] = Object.values(error.constraints || {});
        });
      } else {
        // Simple string array
        (errors as string[]).forEach((error, index) => {
          formatted[`field_${index}`] = [error];
        });
      }
    }

    return formatted;
  }
}
