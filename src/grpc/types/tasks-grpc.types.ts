import { GrpcBaseRequest, GrpcPaginationParams, GrpcPaginationResponse } from './grpc-common.types';

export interface ListTasksRequest extends GrpcBaseRequest, GrpcPaginationParams {
  project_id: string;
  status?: string;
  priority?: string;
  assignee_id?: string;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TaskResponse {
  id: string;
  project_id: string;
  parent_task_id?: string | null;
  task_title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: Date | null;
  estimated_hours?: number | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ListTasksResponse {
  tasks: TaskResponse[];
  pagination: GrpcPaginationResponse;
}

export interface GetTaskRequest extends GrpcBaseRequest {
  id: string;
}

export interface GetTaskResponse {
  task: TaskResponse;
}

export interface CreateTaskRequest extends GrpcBaseRequest {
  project_id: string;
  task_title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  estimated_hours?: number;
  parent_task_id?: string;
}

export interface CreateTaskResponse {
  task: TaskResponse;
}

export interface UpdateTaskRequest extends GrpcBaseRequest {
  id: string;
  task_title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  estimated_hours?: number;
}

export interface UpdateTaskResponse {
  task: TaskResponse;
}

export interface DeleteTaskRequest extends GrpcBaseRequest {
  id: string;
}

export interface DeleteTaskResponse {
  message: string;
}

