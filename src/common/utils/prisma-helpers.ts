import { generateUlid } from './ulid.util';

/**
 * Adds ULID to data object if id is missing
 */
export function withUlid<T extends Record<string, unknown>>(
  data: T,
): T & { id: string } {
  return {
    ...data,
    id: (data.id as string | undefined) || generateUlid(),
  };
}

/**
 * Adds ULID to array of data objects
 */
export function withUlidArray<T extends Record<string, unknown>>(
  data: T[],
): Array<T & { id: string }> {
  return data.map((item) => ({
    ...item,
    id: (item.id as string | undefined) || generateUlid(),
  }));
}
