import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CollaborationService } from '../pms/collaboration/collaboration.service';
import type {
  ListCommentsRequest,
  ListCommentsResponse,
  GetCommentRequest,
  GetCommentResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  ListTimeLogsRequest,
  ListTimeLogsResponse,
  GetTimeLogRequest,
  GetTimeLogResponse,
  CreateTimeLogRequest,
  CreateTimeLogResponse,
} from './types';
import {
  mapCommentToGrpc,
  mapTimeLogToGrpc,
  toGrpcPaginationResponse,
} from './utils';

@Controller()
export class CollaborationGrpcController {
  constructor(private collaborationService: CollaborationService) {}

  @GrpcMethod('CollaborationService', 'ListComments')
  async listComments(data: ListCommentsRequest): Promise<ListCommentsResponse> {
    const result = await this.collaborationService.getComments(
      {
        page: data.page || 1,
        limit: data.limit || 50,
        commentableType: data.commentable_type,
        commentableId: data.commentable_id,
        sortBy: data.sort_by || 'createdAt',
        sortOrder: data.sort_order || 'asc',
        includeDeleted: data.include_deleted || false,
      },
      data.user_id,
    );
    return {
      comments: result.data.map(mapCommentToGrpc),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }

  @GrpcMethod('CollaborationService', 'GetComment')
  async getComment(data: GetCommentRequest): Promise<GetCommentResponse> {
    // Get all comments and find the one we need
    // In a real implementation, you might want to add a findOne method to the service
    const result = await this.collaborationService.getComments(
      {
        page: 1,
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      },
      data.user_id,
    );
    const comment = result.data.find((c) => c.id === data.id);
    return { comment: comment ? mapCommentToGrpc(comment) : undefined };
  }

  @GrpcMethod('CollaborationService', 'CreateComment')
  async createComment(
    data: CreateCommentRequest,
  ): Promise<CreateCommentResponse> {
    const comment = await this.collaborationService.createComment(
      data.user_id,
      {
        commentableType: data.commentable_type,
        commentableId: data.commentable_id,
        commentText: data.comment_text,
        parentCommentId: data.parent_comment_id,
      },
    );
    return { comment: mapCommentToGrpc(comment) };
  }

  @GrpcMethod('CollaborationService', 'UpdateComment')
  async updateComment(
    data: UpdateCommentRequest,
  ): Promise<UpdateCommentResponse> {
    const comment = await this.collaborationService.updateComment(
      data.id,
      data.user_id,
      {
        commentText: data.comment_text,
      },
    );
    return { comment: mapCommentToGrpc(comment) };
  }

  @GrpcMethod('CollaborationService', 'DeleteComment')
  async deleteComment(
    data: DeleteCommentRequest,
  ): Promise<DeleteCommentResponse> {
    await this.collaborationService.deleteComment(data.id, data.user_id);
    return { message: 'Comment deleted successfully' };
  }

  @GrpcMethod('CollaborationService', 'ListTimeLogs')
  async listTimeLogs(data: ListTimeLogsRequest): Promise<ListTimeLogsResponse> {
    const result = await this.collaborationService.getTaskTimeLogs(
      {
        page: data.page || 1,
        limit: data.limit || 50,
        userId: data.user_id,
        logDateFrom: data.log_date_from,
        logDateTo: data.log_date_to,
        sortBy: data.sort_by || 'logDate',
        sortOrder: data.sort_order || 'desc',
      },
      data.task_id,
      data.user_id,
    );
    return {
      time_logs: result.data.map(mapTimeLogToGrpc),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }

  @GrpcMethod('CollaborationService', 'GetTimeLog')
  async getTimeLog(data: GetTimeLogRequest): Promise<GetTimeLogResponse> {
    const result = await this.collaborationService.getTaskTimeLogs(
      {
        page: 1,
        limit: 1000,
        sortBy: 'logDate',
        sortOrder: 'desc',
      },
      data.task_id,
      data.user_id,
    );
    const timeLog = result.data.find((tl) => tl.id === data.id);
    return { time_log: timeLog ? mapTimeLogToGrpc(timeLog) : undefined };
  }

  @GrpcMethod('CollaborationService', 'CreateTimeLog')
  async createTimeLog(
    data: CreateTimeLogRequest,
  ): Promise<CreateTimeLogResponse> {
    if (!data.log_date) {
      throw new Error('log_date is required');
    }
    const timeLog = await this.collaborationService.createTimeLog(
      data.user_id,
      {
        taskId: data.task_id,
        hoursLogged: data.hours_logged,
        logDate: new Date(data.log_date),
        description: data.description,
        isBillable: data.is_billable,
      },
    );
    return { time_log: mapTimeLogToGrpc(timeLog) };
  }
}
