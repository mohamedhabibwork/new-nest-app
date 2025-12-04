import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string, metadata: ArgumentMetadata): Date {
    if (!value) {
      throw new BadRequestException(`${metadata.data} is required`);
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `${metadata.data} must be a valid date string`,
      );
    }

    return date;
  }
}
