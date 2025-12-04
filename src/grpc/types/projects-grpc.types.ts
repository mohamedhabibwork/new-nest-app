import {
  GrpcBaseRequest,
  GrpcPaginationParams,
  GrpcPaginationResponse,
} from './grpc-common.types';

export interface ListProjectsRequest
  extends GrpcBaseRequest, GrpcPaginationParams {
  workspace_id: string;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ProjectResponse {
  id: string;
  workspace_id: string;
  project_name: string;
  description?: string | null;
  status: string;
  priority: string;
  start_date?: Date | null;
  end_date?: Date | null;
  project_manager_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ListProjectsResponse {
  projects: ProjectResponse[];
  pagination: GrpcPaginationResponse;
}

export interface GetProjectRequest extends GrpcBaseRequest {
  id: string;
}

export interface GetProjectResponse {
  project: ProjectResponse;
}

export interface CreateProjectRequest extends GrpcBaseRequest {
  workspace_id: string;
  project_name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  priority?: string;
}

export interface CreateProjectResponse {
  project: ProjectResponse;
}

export interface UpdateProjectRequest extends GrpcBaseRequest {
  id: string;
  project_name?: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  priority?: string;
}

export interface UpdateProjectResponse {
  project: ProjectResponse;
}

export interface DeleteProjectRequest extends GrpcBaseRequest {
  id: string;
}

export interface DeleteProjectResponse {
  message: string;
}
