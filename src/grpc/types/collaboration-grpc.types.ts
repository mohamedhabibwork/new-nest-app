import { GrpcBaseRequest, GrpcPaginationParams, GrpcPaginationResponse } from './grpc-common.types';
import { Comment } from '@prisma/client';
import { TimeLog } from '@prisma/client';

export interface ListCommentsRequest extends GrpcBaseRequest, GrpcPaginationParams {
  task_id: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CommentResponse {
  id: string;
  task_id: string;
  user_id: string;
  comment_text: string;
  parent_comment_id?: string | null;
  created_at: Date;
  updated_at: Date;
  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface ListCommentsResponse {
  comments: CommentResponse[];
  pagination: GrpcPaginationResponse;
}

export interface GetCommentRequest extends GrpcBaseRequest {
  id: string;
  task_id: string;
}

export interface GetCommentResponse {
  comment?: CommentResponse;
}

export interface CreateCommentRequest extends GrpcBaseRequest {
  task_id: string;
  comment_text: string;
  parent_comment_id?: string;
}

export interface CreateCommentResponse {
  comment: CommentResponse;
}

export interface UpdateCommentRequest extends GrpcBaseRequest {
  id: string;
  comment_text: string;
}

export interface UpdateCommentResponse {
  comment: CommentResponse;
}

export interface DeleteCommentRequest extends GrpcBaseRequest {
  id: string;
}

export interface DeleteCommentResponse {
  message: string;
}

export interface ListTimeLogsRequest extends GrpcPaginationParams {
  user_id: string;
  task_id: string;
  log_date_from?: string;
  log_date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TimeLogResponse {
  id: string;
  task_id: string;
  user_id: string;
  hours_logged: number;
  log_date: Date;
  description?: string | null;
  is_billable: boolean;
  created_at: Date;
  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface ListTimeLogsResponse {
  time_logs: TimeLogResponse[];
  pagination: GrpcPaginationResponse;
}

export interface GetTimeLogRequest extends GrpcBaseRequest {
  id: string;
  task_id: string;
}

export interface GetTimeLogResponse {
  time_log?: TimeLogResponse;
}

export interface CreateTimeLogRequest extends GrpcBaseRequest {
  task_id: string;
  hours_logged: number;
  log_date: string;
  description?: string;
  is_billable?: boolean;
}

export interface CreateTimeLogResponse {
  time_log: TimeLogResponse;
}

