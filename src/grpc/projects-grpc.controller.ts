import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProjectsService } from '../pms/projects/projects.service';
import type {
  ListProjectsRequest,
  ListProjectsResponse,
  GetProjectRequest,
  GetProjectResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  DeleteProjectRequest,
  DeleteProjectResponse,
} from './types';
import {
  mapProjectToGrpc,
  toGrpcPaginationResponse,
  fromGrpcDate,
} from './utils';

@Controller()
export class ProjectsGrpcController {
  constructor(private projectsService: ProjectsService) {}

  @GrpcMethod('ProjectService', 'ListProjects')
  async listProjects(data: ListProjectsRequest): Promise<ListProjectsResponse> {
    const result = await this.projectsService.findAll(
      {
        workspaceId: data.workspace_id,
        page: data.page || 1,
        limit: data.limit || 50,
        status: data.status,
        search: data.search,
        sortBy: data.sort_by || 'createdAt',
        sortOrder: data.sort_order || 'desc',
      },
      data.user_id,
    );
    return {
      projects: result.data.map(mapProjectToGrpc),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }

  @GrpcMethod('ProjectService', 'GetProject')
  async getProject(data: GetProjectRequest): Promise<GetProjectResponse> {
    const project = await this.projectsService.findOne(data.id, data.user_id);
    return { project: mapProjectToGrpc(project) };
  }

  @GrpcMethod('ProjectService', 'CreateProject')
  async createProject(
    data: CreateProjectRequest,
  ): Promise<CreateProjectResponse> {
    const project = await this.projectsService.create(data.user_id, {
      workspaceId: data.workspace_id,
      projectName: data.project_name,
      description: data.description,
      startDate: fromGrpcDate(data.start_date),
      endDate: fromGrpcDate(data.end_date),
      priority: data.priority,
    });
    return { project: mapProjectToGrpc(project) };
  }

  @GrpcMethod('ProjectService', 'UpdateProject')
  async updateProject(
    data: UpdateProjectRequest,
  ): Promise<UpdateProjectResponse> {
    const project = await this.projectsService.update(data.id, data.user_id, {
      projectName: data.project_name,
      description: data.description,
      status: data.status,
      startDate: fromGrpcDate(data.start_date),
      endDate: fromGrpcDate(data.end_date),
      priority: data.priority,
    });
    return { project: mapProjectToGrpc(project) };
  }

  @GrpcMethod('ProjectService', 'DeleteProject')
  async deleteProject(
    data: DeleteProjectRequest,
  ): Promise<DeleteProjectResponse> {
    await this.projectsService.remove(data.id, data.user_id);
    return { message: 'Project deleted successfully' };
  }
}
