import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

const ULID_REGEX = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

@Injectable()
export class ParseULIDPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      throw new BadRequestException(`${metadata.data} is required`);
    }

    if (typeof value !== 'string') {
      throw new BadRequestException(`${metadata.data} must be a string`);
    }

    if (!ULID_REGEX.test(value)) {
      throw new BadRequestException(`${metadata.data} must be a valid ULID`);
    }

    return value;
  }
}

