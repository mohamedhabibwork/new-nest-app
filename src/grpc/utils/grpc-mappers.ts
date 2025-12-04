/**
 * Mappers to convert Prisma models to gRPC response types
 */

import { Comment, TimeLog, Notification, Project, Workspace, Task, File, User } from '@prisma/client';
import type {
  CommentResponse,
  TimeLogResponse,
  NotificationResponse,
  ProjectResponse,
  WorkspaceResponse,
  TaskResponse,
  FileResponse,
  UserResponse,
} from '../types';

/**
 * Map Prisma Comment to gRPC CommentResponse
 */
export function mapCommentToGrpc(comment: Comment & { user?: { id: string; email: string; firstName: string | null; lastName: string | null } }): CommentResponse {
  return {
    id: comment.id,
    task_id: comment.taskId,
    user_id: comment.userId,
    comment_text: comment.commentText,
    parent_comment_id: comment.parentCommentId,
    created_at: comment.createdAt,
    updated_at: comment.updatedAt,
    user: comment.user ? {
      id: comment.user.id,
      email: comment.user.email,
      first_name: comment.user.firstName,
      last_name: comment.user.lastName,
    } : undefined,
  };
}

/**
 * Map Prisma TimeLog to gRPC TimeLogResponse
 */
export function mapTimeLogToGrpc(timeLog: TimeLog & { user?: { id: string; email: string; firstName: string | null; lastName: string | null } }): TimeLogResponse {
  return {
    id: timeLog.id,
    task_id: timeLog.taskId,
    user_id: timeLog.userId,
    hours_logged: Number(timeLog.hoursLogged),
    log_date: timeLog.logDate,
    description: timeLog.description,
    is_billable: timeLog.isBillable,
    created_at: timeLog.createdAt,
    user: timeLog.user ? {
      id: timeLog.user.id,
      email: timeLog.user.email,
      first_name: timeLog.user.firstName,
      last_name: timeLog.user.lastName,
    } : undefined,
  };
}

/**
 * Map Prisma Notification to gRPC NotificationResponse
 */
export function mapNotificationToGrpc(notification: Notification): NotificationResponse {
  return {
    id: notification.id,
    user_id: notification.userId,
    message: notification.message,
    notification_type: notification.notificationType,
    entity_type: notification.entityType,
    entity_id: notification.entityId,
    is_read: notification.isRead,
    created_at: notification.createdAt,
  };
}

/**
 * Map Prisma Project to gRPC ProjectResponse
 */
export function mapProjectToGrpc(project: Project): ProjectResponse {
  return {
    id: project.id,
    workspace_id: project.workspaceId,
    project_name: project.projectName,
    description: project.description,
    status: project.status,
    priority: project.priority,
    start_date: project.startDate || undefined,
    end_date: project.endDate || undefined,
    project_manager_id: project.projectManagerId,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

/**
 * Map Prisma Workspace to gRPC WorkspaceResponse
 */
export function mapWorkspaceToGrpc(workspace: Workspace): WorkspaceResponse {
  return {
    id: workspace.id,
    workspace_name: workspace.workspaceName,
    description: workspace.description,
    owner_id: workspace.ownerId,
    created_at: workspace.createdAt,
    updated_at: workspace.updatedAt,
  };
}

/**
 * Map Prisma Task to gRPC TaskResponse
 */
export function mapTaskToGrpc(task: Task): TaskResponse {
  return {
    id: task.id,
    project_id: task.projectId,
    parent_task_id: task.parentTaskId,
    task_title: task.taskTitle,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate,
    estimated_hours: task.estimatedHours,
    created_by: task.createdBy,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

/**
 * Map Prisma Attachment to gRPC FileResponse
 */
export function mapFileToGrpc(file: File & { uploader?: { id: string; email: string; firstName: string | null; lastName: string | null } }): FileResponse {
  return {
    id: file.id,
    entity_type: file.entityType,
    entity_id: file.entityId,
    file_name: file.fileName,
    file_path: file.filePath,
    file_url: file.fileUrl || '',
    file_type: file.fileType,
    file_size: file.fileSize,
    storage_type: file.storageType,
    metadata: file.metadata as Record<string, unknown> | null,
    uploaded_by: file.uploadedBy,
    uploaded_at: file.uploadedAt,
    uploader: file.uploader ? {
      id: file.uploader.id,
      email: file.uploader.email,
      first_name: file.uploader.firstName,
      last_name: file.uploader.lastName,
    } : undefined,
  };
}

/**
 * Map Prisma User to gRPC UserResponse
 * Accepts User or UserWithoutPassword (Omit<User, 'password'>)
 */
export function mapUserToGrpc(user: User | Omit<User, 'password'>): UserResponse {
  return {
    id: user.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    email_verified: user.emailVerified,
    two_factor_enabled: 'is2FAEnabled' in user ? user.is2FAEnabled : false,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

