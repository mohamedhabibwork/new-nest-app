import { Transform } from 'class-transformer';

export function TransformDate() {
  return Transform(({ value }) => {
    if (!value) {
      return value;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  });
}
