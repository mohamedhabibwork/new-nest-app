import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer/types/interfaces';

export function Serialize(dto: ClassConstructor<any>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // This decorator is used with @UseInterceptors(new SerializeInterceptor(dto))
    return descriptor;
  };
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly dto: ClassConstructor<any>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data === null || data === undefined) {
          return data;
        }

        // Handle pagination responses
        if (data.pagination && Array.isArray(data.data)) {
          return {
            ...data,
            data: plainToInstance(this.dto, data.data, {
              excludeExtraneousValues: true,
            }),
          };
        }

        // Handle arrays
        if (Array.isArray(data)) {
          return plainToInstance(this.dto, data, {
            excludeExtraneousValues: true,
          });
        }

        // Handle single objects
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
