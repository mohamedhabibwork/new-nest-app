import { GrpcBaseRequest, GrpcPaginationParams, GrpcPaginationResponse } from './grpc-common.types';

export interface ListWorkspacesRequest extends GrpcBaseRequest, GrpcPaginationParams {
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface WorkspaceResponse {
  id: string;
  workspace_name: string;
  description?: string | null;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ListWorkspacesResponse {
  workspaces: WorkspaceResponse[];
  pagination: GrpcPaginationResponse;
}

export interface GetWorkspaceRequest extends GrpcBaseRequest {
  id: string;
}

export interface GetWorkspaceResponse {
  workspace: WorkspaceResponse;
}

export interface CreateWorkspaceRequest extends GrpcBaseRequest {
  workspace_name: string;
  description?: string;
}

export interface CreateWorkspaceResponse {
  workspace: WorkspaceResponse;
}

export interface UpdateWorkspaceRequest extends GrpcBaseRequest {
  id: string;
  workspace_name?: string;
  description?: string;
}

export interface UpdateWorkspaceResponse {
  workspace: WorkspaceResponse;
}

export interface DeleteWorkspaceRequest extends GrpcBaseRequest {
  id: string;
}

export interface DeleteWorkspaceResponse {
  message: string;
}

