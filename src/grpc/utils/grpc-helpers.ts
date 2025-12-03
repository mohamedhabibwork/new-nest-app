/**
 * Utility functions for gRPC controllers
 */

import { GrpcPaginationResponse, GrpcPaginationParams } from '../types/grpc-common.types';
import { PaginationMetaDto } from '../../common/dto/pagination-response.dto';

/**
 * Convert REST pagination response to gRPC format
 */
export function toGrpcPaginationResponse(
  pagination: PaginationMetaDto,
): GrpcPaginationResponse {
  return {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    total_pages: pagination.totalPages,
    has_next: pagination.hasNext,
    has_previous: pagination.hasPrevious,
  };
}

/**
 * Normalize pagination parameters from gRPC request
 */
export function normalizeGrpcPagination(
  params?: GrpcPaginationParams,
): { page: number; limit: number } {
  return {
    page: Math.max(1, params?.page || 1),
    limit: Math.min(Math.max(1, params?.limit || 50), 100),
  };
}

/**
 * Convert Prisma date to ISO string for gRPC
 */
export function toGrpcDate(date: Date | null | undefined): string | undefined {
  return date ? date.toISOString() : undefined;
}

/**
 * Convert ISO string to Date for gRPC
 */
export function fromGrpcDate(dateString?: string): Date | undefined {
  return dateString ? new Date(dateString) : undefined;
}

/**
 * Convert snake_case to camelCase for nested objects
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

