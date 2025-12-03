import { GrpcBaseRequest, GrpcPaginationParams, GrpcPaginationResponse } from './grpc-common.types';

export interface ListFilesRequest extends GrpcBaseRequest, GrpcPaginationParams {
  entity_type: string;
  entity_id: string;
}

export interface FileResponse {
  id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  storage_type: string;
  metadata?: Record<string, unknown> | null;
  uploaded_by: string;
  uploaded_at: Date;
  uploader?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface ListFilesResponse {
  files: FileResponse[];
  pagination: GrpcPaginationResponse;
}

export interface GetFileRequest extends GrpcBaseRequest {
  id: string;
}

export interface GetFileResponse {
  file: FileResponse;
}

export interface DeleteFileRequest extends GrpcBaseRequest {
  id: string;
}

export interface DeleteFileResponse {
  message: string;
}

export interface MoveFileRequest extends GrpcBaseRequest {
  id: string;
  entity_type: string;
  entity_id: string;
}

export interface MoveFileResponse {
  file: FileResponse;
}

