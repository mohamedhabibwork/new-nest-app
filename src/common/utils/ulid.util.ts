import { ulid } from 'ulid';

/**
 * Generate a new ULID
 * @returns A new ULID string
 */
export function generateUlid(): string {
  return ulid();
}

/**
 * Validate if a string is a valid ULID
 * @param id - The string to validate
 * @returns True if valid ULID, false otherwise
 */
export function isValidUlid(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // ULID is 26 characters, base32 encoded (0-9, A-Z excluding I, L, O, U)
  const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
  return ulidRegex.test(id);
}

