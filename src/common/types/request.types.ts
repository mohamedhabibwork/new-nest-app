/**
 * Common request types for NestJS controllers
 */

import { Request } from 'express';

/**
 * Authenticated user object from JWT
 */
export interface AuthenticatedUser {
  id: string;
  email?: string;
}

/**
 * Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  sub: string; // User ID
  email?: string;
  jti?: string; // JWT ID for session tracking
  iat?: number; // Issued at
  exp?: number; // Expiration
}
