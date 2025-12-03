import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TasksService } from '../pms/tasks/tasks.service';
import type {
  ListTasksRequest,
  ListTasksResponse,
  GetTaskRequest,
  GetTaskResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  DeleteTaskRequest,
  DeleteTaskResponse,
} from './types';
import { mapTaskToGrpc, toGrpcPaginationResponse, fromGrpcDate } from './utils';

@Controller()
export class TasksGrpcController {
  constructor(private tasksService: TasksService) {}

  @GrpcMethod('TaskService', 'ListTasks')
  async listTasks(data: ListTasksRequest): Promise<ListTasksResponse> {
    const result = await this.tasksService.findAll(
      {
        projectId: data.project_id,
        page: data.page || 1,
        limit: data.limit || 50,
        status: data.status,
        priority: data.priority,
        assigneeId: data.assignee_id,
        dueDateFrom: data.due_date_from,
        dueDateTo: data.due_date_to,
        search: data.search,
        sortBy: data.sort_by || 'createdAt',
        sortOrder: data.sort_order || 'desc',
      },
      data.user_id,
    );
    return {
      tasks: result.data.map(mapTaskToGrpc),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }

  @GrpcMethod('TaskService', 'GetTask')
  async getTask(data: GetTaskRequest): Promise<GetTaskResponse> {
    const task = await this.tasksService.findOne(data.id, data.user_id);
    return { task: mapTaskToGrpc(task) };
  }

  @GrpcMethod('TaskService', 'CreateTask')
  async createTask(data: CreateTaskRequest): Promise<CreateTaskResponse> {
    const task = await this.tasksService.create(data.user_id, {
      projectId: data.project_id,
      taskTitle: data.task_title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: fromGrpcDate(data.due_date),
      estimatedHours: data.estimated_hours,
      parentTaskId: data.parent_task_id,
    });
    return { task: mapTaskToGrpc(task) };
  }

  @GrpcMethod('TaskService', 'UpdateTask')
  async updateTask(data: UpdateTaskRequest): Promise<UpdateTaskResponse> {
    const task = await this.tasksService.update(data.id, data.user_id, {
      taskTitle: data.task_title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: fromGrpcDate(data.due_date),
      estimatedHours: data.estimated_hours,
    });
    return { task: mapTaskToGrpc(task) };
  }

  @GrpcMethod('TaskService', 'DeleteTask')
  async deleteTask(data: DeleteTaskRequest): Promise<DeleteTaskResponse> {
    await this.tasksService.remove(data.id, data.user_id);
    return { message: 'Task deleted successfully' };
  }
}

