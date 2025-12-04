import { Injectable } from '@nestjs/common';
import { PmsGateway } from './pms.gateway';

@Injectable()
export class WebSocketEventsService {
  constructor(private pmsGateway: PmsGateway) {}

  /**
   * Emit task created event
   */
  emitTaskCreated(
    taskId: string,
    projectId: string,
    workspaceId: string,
    task: any,
  ) {
    this.pmsGateway.server.to(`project:${projectId}`).emit('task:created', {
      taskId,
      projectId,
      workspaceId,
      task,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit task updated event
   */
  emitTaskUpdated(
    taskId: string,
    projectId: string,
    workspaceId: string,
    changes: any,
  ) {
    this.pmsGateway.server.to(`task:${taskId}`).emit('task:updated', {
      taskId,
      projectId,
      workspaceId,
      changes,
      timestamp: new Date().toISOString(),
    });
    this.pmsGateway.server.to(`project:${projectId}`).emit('task:updated', {
      taskId,
      projectId,
      workspaceId,
      changes,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit task deleted event
   */
  emitTaskDeleted(taskId: string, projectId: string, workspaceId: string) {
    this.pmsGateway.server.to(`task:${taskId}`).emit('task:deleted', {
      taskId,
      projectId,
      workspaceId,
      timestamp: new Date().toISOString(),
    });
    this.pmsGateway.server.to(`project:${projectId}`).emit('task:deleted', {
      taskId,
      projectId,
      workspaceId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit comment added event
   */
  emitCommentAdded(
    taskId: string,
    projectId: string | undefined,
    comment: unknown,
  ) {
    this.pmsGateway.server.to(`task:${taskId}`).emit('comment:added', {
      taskId,
      projectId,
      comment,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit comment updated event
   */
  emitCommentUpdated(
    taskId: string,
    projectId: string,
    commentId: string,
    comment: any,
  ) {
    this.pmsGateway.server.to(`task:${taskId}`).emit('comment:updated', {
      taskId,
      projectId,
      commentId,
      comment,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit project created event
   */
  emitProjectCreated(projectId: string, workspaceId: string, project: any) {
    this.pmsGateway.server
      .to(`workspace:${workspaceId}`)
      .emit('project:created', {
        projectId,
        workspaceId,
        project,
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Emit project updated event
   */
  emitProjectUpdated(projectId: string, workspaceId: string, changes: any) {
    this.pmsGateway.server.to(`project:${projectId}`).emit('project:updated', {
      projectId,
      workspaceId,
      changes,
      timestamp: new Date().toISOString(),
    });
    this.pmsGateway.server
      .to(`workspace:${workspaceId}`)
      .emit('project:updated', {
        projectId,
        workspaceId,
        changes,
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Emit notification created event
   */
  emitNotificationCreated(userId: string, notification: any) {
    this.pmsGateway.server.to(`user:${userId}`).emit('notification:created', {
      notification,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit file uploaded event
   */
  emitFileUploaded(entityType: string, entityId: string, file: any) {
    if (entityType === 'task') {
      this.pmsGateway.server.to(`task:${entityId}`).emit('file:uploaded', {
        entityType,
        entityId,
        file,
        timestamp: new Date().toISOString(),
      });
    } else if (entityType === 'project') {
      this.pmsGateway.server.to(`project:${entityId}`).emit('file:uploaded', {
        entityType,
        entityId,
        file,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emit time logged event
   */
  emitTimeLogged(taskId: string, projectId: string, timeLog: any) {
    this.pmsGateway.server.to(`task:${taskId}`).emit('time:logged', {
      taskId,
      projectId,
      timeLog,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit share created event
   */
  emitShareCreated(share: any) {
    const room = `${share.shareableType}:${share.shareableId}`;
    this.pmsGateway.server.to(room).emit('share:created', {
      share,
      timestamp: new Date().toISOString(),
    });
    // Also emit to recipient
    if (share.sharedWithType === 'users') {
      this.pmsGateway.server
        .to(`user:${share.sharedWithId}`)
        .emit('share:created', {
          share,
          timestamp: new Date().toISOString(),
        });
    }
  }

  /**
   * Emit share updated event
   */
  emitShareUpdated(share: any) {
    const room = `${share.shareableType}:${share.shareableId}`;
    this.pmsGateway.server.to(room).emit('share:updated', {
      share,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit share removed event
   */
  emitShareRemoved(
    shareId: string,
    shareableType: string,
    shareableId: string,
  ) {
    const room = `${shareableType}:${shareableId}`;
    this.pmsGateway.server.to(room).emit('share:removed', {
      shareId,
      shareableType,
      shareableId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit assignment created event
   */
  emitAssignmentCreated(assignment: any) {
    const room = `${assignment.assignableType}:${assignment.assignableId}`;
    this.pmsGateway.server.to(room).emit('assignment:created', {
      assignment,
      timestamp: new Date().toISOString(),
    });
    // Also emit to assignee
    this.pmsGateway.server
      .to(`user:${assignment.assigneeId}`)
      .emit('assignment:created', {
        assignment,
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Emit assignment updated event
   */
  emitAssignmentUpdated(assignment: any) {
    const room = `${assignment.assignableType}:${assignment.assignableId}`;
    this.pmsGateway.server.to(room).emit('assignment:updated', {
      assignment,
      timestamp: new Date().toISOString(),
    });
    // Also emit to assignee
    this.pmsGateway.server
      .to(`user:${assignment.assigneeId}`)
      .emit('assignment:updated', {
        assignment,
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Emit assignment removed event
   */
  emitAssignmentRemoved(
    assignmentId: string,
    assignableType: string,
    assignableId: string,
  ) {
    const room = `${assignableType}:${assignableId}`;
    this.pmsGateway.server.to(room).emit('assignment:removed', {
      assignmentId,
      assignableType,
      assignableId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit mention created event
   */
  emitMentionCreated(mention: {
    mentionedUserId: string;
    [key: string]: unknown;
  }) {
    this.pmsGateway.server
      .to(`user:${mention.mentionedUserId}`)
      .emit('mention:created', {
        mention,
        timestamp: new Date().toISOString(),
      });
  }
}
