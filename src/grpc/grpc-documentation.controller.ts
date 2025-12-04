import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller to document gRPC endpoints in Swagger
 * Since Swagger/OpenAPI is for HTTP APIs, we document gRPC endpoints here
 * as informational endpoints
 */
@ApiTags('grpc')
@Controller('grpc')
export class GrpcDocumentationController {
  @Get('endpoints')
  @ApiOperation({
    summary: 'List all available gRPC endpoints',
    description:
      'This endpoint provides documentation for all available gRPC endpoints. ' +
      'gRPC endpoints use Protocol Buffers and are accessible via gRPC clients. ' +
      'The gRPC server runs on a separate port (default: 5000) when GRPC_ENABLED=true.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of gRPC endpoints',
    schema: {
      type: 'object',
      properties: {
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              service: { type: 'string' },
              methods: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    requestType: { type: 'string' },
                    responseType: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  getGrpcEndpoints() {
    return {
      services: [
        {
          service: 'AuthService',
          methods: [
            {
              name: 'Register',
              description: 'Register a new user',
              requestType: 'RegisterRequest',
              responseType: 'RegisterResponse',
            },
            {
              name: 'Login',
              description: 'Login user and get access token',
              requestType: 'LoginRequest',
              responseType: 'LoginResponse',
            },
            {
              name: 'VerifyEmail',
              description: 'Verify user email address',
              requestType: 'VerifyEmailRequest',
              responseType: 'VerifyEmailResponse',
            },
            {
              name: 'ForgotPassword',
              description: 'Request password reset',
              requestType: 'ForgotPasswordRequest',
              responseType: 'ForgotPasswordResponse',
            },
            {
              name: 'ResetPassword',
              description: 'Reset password with token',
              requestType: 'ResetPasswordRequest',
              responseType: 'ResetPasswordResponse',
            },
            {
              name: 'GetProfile',
              description: 'Get user profile',
              requestType: 'GetProfileRequest',
              responseType: 'GetProfileResponse',
            },
          ],
        },
        {
          service: 'WorkspaceService',
          methods: [
            {
              name: 'ListWorkspaces',
              description: 'List all workspaces for a user (with pagination)',
              requestType: 'ListWorkspacesRequest',
              responseType: 'ListWorkspacesResponse',
            },
            {
              name: 'GetWorkspace',
              description: 'Get workspace by ID',
              requestType: 'GetWorkspaceRequest',
              responseType: 'GetWorkspaceResponse',
            },
            {
              name: 'CreateWorkspace',
              description: 'Create a new workspace',
              requestType: 'CreateWorkspaceRequest',
              responseType: 'CreateWorkspaceResponse',
            },
            {
              name: 'UpdateWorkspace',
              description: 'Update workspace',
              requestType: 'UpdateWorkspaceRequest',
              responseType: 'UpdateWorkspaceResponse',
            },
            {
              name: 'DeleteWorkspace',
              description: 'Delete workspace',
              requestType: 'DeleteWorkspaceRequest',
              responseType: 'DeleteWorkspaceResponse',
            },
          ],
        },
        {
          service: 'ProjectService',
          methods: [
            {
              name: 'ListProjects',
              description:
                'List all projects (with pagination, filtering, sorting)',
              requestType: 'ListProjectsRequest',
              responseType: 'ListProjectsResponse',
            },
            {
              name: 'GetProject',
              description: 'Get project by ID',
              requestType: 'GetProjectRequest',
              responseType: 'GetProjectResponse',
            },
            {
              name: 'CreateProject',
              description: 'Create a new project',
              requestType: 'CreateProjectRequest',
              responseType: 'CreateProjectResponse',
            },
            {
              name: 'UpdateProject',
              description: 'Update project',
              requestType: 'UpdateProjectRequest',
              responseType: 'UpdateProjectResponse',
            },
            {
              name: 'DeleteProject',
              description: 'Delete project',
              requestType: 'DeleteProjectRequest',
              responseType: 'DeleteProjectResponse',
            },
          ],
        },
        {
          service: 'TaskService',
          methods: [
            {
              name: 'ListTasks',
              description:
                'List all tasks (with pagination, filtering, sorting)',
              requestType: 'ListTasksRequest',
              responseType: 'ListTasksResponse',
            },
            {
              name: 'GetTask',
              description: 'Get task by ID',
              requestType: 'GetTaskRequest',
              responseType: 'GetTaskResponse',
            },
            {
              name: 'CreateTask',
              description: 'Create a new task',
              requestType: 'CreateTaskRequest',
              responseType: 'CreateTaskResponse',
            },
            {
              name: 'UpdateTask',
              description: 'Update task',
              requestType: 'UpdateTaskRequest',
              responseType: 'UpdateTaskResponse',
            },
            {
              name: 'DeleteTask',
              description: 'Delete task',
              requestType: 'DeleteTaskRequest',
              responseType: 'DeleteTaskResponse',
            },
          ],
        },
        {
          service: 'CollaborationService',
          methods: [
            {
              name: 'ListComments',
              description:
                'List comments for a task (with pagination, sorting)',
              requestType: 'ListCommentsRequest',
              responseType: 'ListCommentsResponse',
            },
            {
              name: 'GetComment',
              description: 'Get comment by ID',
              requestType: 'GetCommentRequest',
              responseType: 'GetCommentResponse',
            },
            {
              name: 'CreateComment',
              description: 'Create a new comment',
              requestType: 'CreateCommentRequest',
              responseType: 'CreateCommentResponse',
            },
            {
              name: 'UpdateComment',
              description: 'Update comment',
              requestType: 'UpdateCommentRequest',
              responseType: 'UpdateCommentResponse',
            },
            {
              name: 'DeleteComment',
              description: 'Delete comment',
              requestType: 'DeleteCommentRequest',
              responseType: 'DeleteCommentResponse',
            },
            {
              name: 'ListTimeLogs',
              description:
                'List time logs for a task (with pagination, filtering, sorting)',
              requestType: 'ListTimeLogsRequest',
              responseType: 'ListTimeLogsResponse',
            },
            {
              name: 'GetTimeLog',
              description: 'Get time log by ID',
              requestType: 'GetTimeLogRequest',
              responseType: 'GetTimeLogResponse',
            },
            {
              name: 'CreateTimeLog',
              description: 'Create a new time log entry',
              requestType: 'CreateTimeLogRequest',
              responseType: 'CreateTimeLogResponse',
            },
          ],
        },
        {
          service: 'NotificationService',
          methods: [
            {
              name: 'ListNotifications',
              description:
                'List notifications for a user (with pagination, filtering)',
              requestType: 'ListNotificationsRequest',
              responseType: 'ListNotificationsResponse',
            },
            {
              name: 'GetNotification',
              description: 'Get notification by ID',
              requestType: 'GetNotificationRequest',
              responseType: 'GetNotificationResponse',
            },
            {
              name: 'MarkAsRead',
              description: 'Mark notification as read',
              requestType: 'MarkAsReadRequest',
              responseType: 'MarkAsReadResponse',
            },
            {
              name: 'MarkAllAsRead',
              description: 'Mark all notifications as read',
              requestType: 'MarkAllAsReadRequest',
              responseType: 'MarkAllAsReadResponse',
            },
            {
              name: 'DeleteNotification',
              description: 'Delete notification',
              requestType: 'DeleteNotificationRequest',
              responseType: 'DeleteNotificationResponse',
            },
          ],
        },
        {
          service: 'FileService',
          methods: [
            {
              name: 'ListFiles',
              description: 'List files for an entity (with pagination)',
              requestType: 'ListFilesRequest',
              responseType: 'ListFilesResponse',
            },
            {
              name: 'GetFile',
              description: 'Get file by ID',
              requestType: 'GetFileRequest',
              responseType: 'GetFileResponse',
            },
            {
              name: 'DeleteFile',
              description: 'Delete file',
              requestType: 'DeleteFileRequest',
              responseType: 'DeleteFileResponse',
            },
            {
              name: 'MoveFile',
              description: 'Move file to different entity',
              requestType: 'MoveFileRequest',
              responseType: 'MoveFileResponse',
            },
          ],
        },
      ],
      note: 'All gRPC endpoints require proper authentication. Use gRPC clients to interact with these endpoints.',
      grpcPort: process.env.GRPC_PORT || '5000',
      enabled: process.env.GRPC_ENABLED === 'true',
    };
  }
}
