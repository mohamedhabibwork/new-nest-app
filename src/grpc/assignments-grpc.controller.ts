import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AssignmentsService } from '../pms/assignments/assignments.service';
import { toGrpcPaginationResponse } from './utils';

@Controller()
export class AssignmentsGrpcController {
  constructor(private assignmentsService: AssignmentsService) {}

  @GrpcMethod('AssignmentService', 'ListAssignments')
  async listAssignments(data: any): Promise<any> {
    const result = await this.assignmentsService.findAll(
      {
        page: data.page || 1,
        limit: data.limit || 50,
        assignableType: data.assignable_type,
        assignableId: data.assignable_id,
        assigneeId: data.assignee_id,
        status: data.status,
        priority: data.priority,
      },
      data.user_id,
    );
    return {
      assignments: result.data.map((assignment) => ({
        id: assignment.id,
        assignable_type: assignment.assignableType,
        assignable_id: assignment.assignableId,
        assignee_id: assignment.assigneeId,
        assigner_id: assignment.assignerId,
        status: assignment.status,
        priority: assignment.priority,
        due_date: assignment.dueDate?.toISOString(),
        notes: assignment.notes,
        assigned_at: assignment.assignedAt.toISOString(),
        completed_at: assignment.completedAt?.toISOString(),
        updated_at: assignment.updatedAt.toISOString(),
        assignee: assignment.assignee
          ? {
              id: assignment.assignee.id,
              email: assignment.assignee.email,
              first_name: assignment.assignee.firstName,
              last_name: assignment.assignee.lastName,
            }
          : undefined,
        assigner: assignment.assigner
          ? {
              id: assignment.assigner.id,
              email: assignment.assigner.email,
              first_name: assignment.assigner.firstName,
              last_name: assignment.assigner.lastName,
            }
          : undefined,
      })),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }

  @GrpcMethod('AssignmentService', 'GetAssignment')
  async getAssignment(data: any): Promise<any> {
    const assignment = await this.assignmentsService.findOne(
      data.id,
      data.user_id,
    );
    return {
      assignment: {
        id: assignment.id,
        assignable_type: assignment.assignableType,
        assignable_id: assignment.assignableId,
        assignee_id: assignment.assigneeId,
        assigner_id: assignment.assignerId,
        status: assignment.status,
        priority: assignment.priority,
        due_date: assignment.dueDate?.toISOString(),
        notes: assignment.notes,
        assigned_at: assignment.assignedAt.toISOString(),
        completed_at: assignment.completedAt?.toISOString(),
        updated_at: assignment.updatedAt.toISOString(),
        assignee: assignment.assignee
          ? {
              id: assignment.assignee.id,
              email: assignment.assignee.email,
              first_name: assignment.assignee.firstName,
              last_name: assignment.assignee.lastName,
            }
          : undefined,
        assigner: assignment.assigner
          ? {
              id: assignment.assigner.id,
              email: assignment.assigner.email,
              first_name: assignment.assigner.firstName,
              last_name: assignment.assigner.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('AssignmentService', 'CreateAssignment')
  async createAssignment(data: any): Promise<any> {
    const assignment = await this.assignmentsService.create(data.user_id, {
      assignableType: data.assignable_type,
      assignableId: data.assignable_id,
      assigneeId: data.assignee_id,
      priority: data.priority,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      notes: data.notes,
    });
    return {
      assignment: {
        id: assignment.id,
        assignable_type: assignment.assignableType,
        assignable_id: assignment.assignableId,
        assignee_id: assignment.assigneeId,
        assigner_id: assignment.assignerId,
        status: assignment.status,
        priority: assignment.priority,
        due_date: assignment.dueDate?.toISOString(),
        notes: assignment.notes,
        assigned_at: assignment.assignedAt.toISOString(),
        completed_at: assignment.completedAt?.toISOString(),
        updated_at: assignment.updatedAt.toISOString(),
        assignee: assignment.assignee
          ? {
              id: assignment.assignee.id,
              email: assignment.assignee.email,
              first_name: assignment.assignee.firstName,
              last_name: assignment.assignee.lastName,
            }
          : undefined,
        assigner: assignment.assigner
          ? {
              id: assignment.assigner.id,
              email: assignment.assigner.email,
              first_name: assignment.assigner.firstName,
              last_name: assignment.assigner.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('AssignmentService', 'UpdateAssignment')
  async updateAssignment(data: any): Promise<any> {
    const assignment = await this.assignmentsService.update(
      data.id,
      data.user_id,
      {
        priority: data.priority,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        notes: data.notes,
      },
    );
    return {
      assignment: {
        id: assignment.id,
        assignable_type: assignment.assignableType,
        assignable_id: assignment.assignableId,
        assignee_id: assignment.assigneeId,
        assigner_id: assignment.assignerId,
        status: assignment.status,
        priority: assignment.priority,
        due_date: assignment.dueDate?.toISOString(),
        notes: assignment.notes,
        assigned_at: assignment.assignedAt.toISOString(),
        completed_at: assignment.completedAt?.toISOString(),
        updated_at: assignment.updatedAt.toISOString(),
        assignee: assignment.assignee
          ? {
              id: assignment.assignee.id,
              email: assignment.assignee.email,
              first_name: assignment.assignee.firstName,
              last_name: assignment.assignee.lastName,
            }
          : undefined,
        assigner: assignment.assigner
          ? {
              id: assignment.assigner.id,
              email: assignment.assigner.email,
              first_name: assignment.assigner.firstName,
              last_name: assignment.assigner.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('AssignmentService', 'UpdateAssignmentStatus')
  async updateAssignmentStatus(data: any): Promise<any> {
    const assignment = await this.assignmentsService.updateStatus(
      data.id,
      data.user_id,
      data.status,
    );
    return {
      assignment: {
        id: assignment.id,
        assignable_type: assignment.assignableType,
        assignable_id: assignment.assignableId,
        assignee_id: assignment.assigneeId,
        assigner_id: assignment.assignerId,
        status: assignment.status,
        priority: assignment.priority,
        due_date: assignment.dueDate?.toISOString(),
        notes: assignment.notes,
        assigned_at: assignment.assignedAt.toISOString(),
        completed_at: assignment.completedAt?.toISOString(),
        updated_at: assignment.updatedAt.toISOString(),
        assignee: assignment.assignee
          ? {
              id: assignment.assignee.id,
              email: assignment.assignee.email,
              first_name: assignment.assignee.firstName,
              last_name: assignment.assignee.lastName,
            }
          : undefined,
        assigner: assignment.assigner
          ? {
              id: assignment.assigner.id,
              email: assignment.assigner.email,
              first_name: assignment.assigner.firstName,
              last_name: assignment.assigner.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('AssignmentService', 'DeleteAssignment')
  async deleteAssignment(data: any): Promise<any> {
    await this.assignmentsService.remove(data.id, data.user_id);
    return { message: 'Assignment removed successfully' };
  }
}
