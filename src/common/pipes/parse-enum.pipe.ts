import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseEnumPipe<T = any> implements PipeTransform<string, T> {
  constructor(
    private readonly enumObject: Record<string, T>,
    private readonly fieldName?: string,
  ) {}

  transform(value: string, metadata: ArgumentMetadata): T {
    if (!value) {
      const field = this.fieldName || metadata.data || 'value';
      throw new BadRequestException(`${field} is required`);
    }

    const enumValues = Object.values(this.enumObject);
    if (!enumValues.includes(value as T)) {
      const field = this.fieldName || metadata.data || 'value';
      throw new BadRequestException(
        `${field} must be one of: ${enumValues.join(', ')}`,
      );
    }

    return value as T;
  }
}
