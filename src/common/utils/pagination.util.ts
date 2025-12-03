import { PaginationMetaDto } from '../dto/pagination-response.dto';
import { Prisma } from '@prisma/client';

/**
 * Build paginated response
 */
export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): { data: T[]; pagination: PaginationMetaDto } {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrevious: page > 1,
    },
  };
}

/**
 * Build Prisma where clause from filters
 */
export function buildPrismaWhere(filters: Record<string, any>): Prisma.JsonObject {
  const where: Prisma.JsonObject = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value;
    }
  }

  return where;
}

/**
 * Build Prisma orderBy clause
 */
export function buildPrismaOrderBy(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc',
): Record<string, 'asc' | 'desc'> | undefined {
  if (!sortBy) {
    return undefined;
  }

  return {
    [sortBy]: sortOrder,
  };
}

/**
 * Calculate skip value for pagination
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Validate and normalize pagination parameters
 */
export function normalizePaginationParams(
  page?: number,
  limit?: number,
  maxLimit: number = 100,
): { page: number; limit: number } {
  const normalizedPage = Math.max(1, page || 1);
  const normalizedLimit = Math.min(Math.max(1, limit || 50), maxLimit);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}

