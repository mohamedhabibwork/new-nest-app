/**
 * Common gRPC types and interfaces
 */

export interface GrpcPaginationParams {
  page?: number;
  limit?: number;
}

export interface GrpcPaginationResponse {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface GrpcBaseRequest {
  user_id: string;
}

export interface GrpcBaseResponse {
  message?: string;
}

export interface GrpcErrorResponse {
  error: string;
  message: string;
  code?: number;
}

