import {
  GrpcBaseRequest,
  GrpcPaginationParams,
  GrpcPaginationResponse,
} from './grpc-common.types';

export interface ListNotificationsRequest
  extends GrpcBaseRequest, GrpcPaginationParams {
  unread_only?: boolean;
  sort_order?: 'asc' | 'desc';
}

export interface NotificationResponse {
  id: string;
  user_id: string;
  message: string;
  notification_type: string;
  entity_type?: string | null;
  entity_id?: string | null;
  is_read: boolean;
  created_at: Date;
}

export interface ListNotificationsResponse {
  notifications: NotificationResponse[];
  pagination: GrpcPaginationResponse;
}

export interface GetNotificationRequest extends GrpcBaseRequest {
  id: string;
}

export interface GetNotificationResponse {
  notification?: NotificationResponse;
}

export interface MarkAsReadRequest extends GrpcBaseRequest {
  id: string;
}

export interface MarkAsReadResponse {
  message: string;
}

export interface MarkAllAsReadRequest extends GrpcBaseRequest {}

export interface MarkAllAsReadResponse {
  message: string;
}

export interface DeleteNotificationRequest extends GrpcBaseRequest {
  id: string;
}

export interface DeleteNotificationResponse {
  message: string;
}
