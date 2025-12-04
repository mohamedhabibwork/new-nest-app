import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WorkspacesService } from '../pms/workspaces/workspaces.service';
import type {
  ListWorkspacesRequest,
  ListWorkspacesResponse,
  GetWorkspaceRequest,
  GetWorkspaceResponse,
  CreateWorkspaceRequest,
  CreateWorkspaceResponse,
  UpdateWorkspaceRequest,
  UpdateWorkspaceResponse,
  DeleteWorkspaceRequest,
  DeleteWorkspaceResponse,
} from './types';
import { mapWorkspaceToGrpc, toGrpcPaginationResponse } from './utils';

@Controller()
export class WorkspacesGrpcController {
  constructor(private workspacesService: WorkspacesService) {}

  @GrpcMethod('WorkspaceService', 'ListWorkspaces')
  async listWorkspaces(
    data: ListWorkspacesRequest,
  ): Promise<ListWorkspacesResponse> {
    const result = await this.workspacesService.findAll(
      {
        page: data.page || 1,
        limit: data.limit || 50,
        search: data.search,
        sortBy: data.sort_by || 'createdAt',
        sortOrder: data.sort_order || 'desc',
      },
      data.user_id,
    );
    return {
      workspaces: result.data.map(mapWorkspaceToGrpc),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }

  @GrpcMethod('WorkspaceService', 'GetWorkspace')
  async getWorkspace(data: GetWorkspaceRequest): Promise<GetWorkspaceResponse> {
    const workspace = await this.workspacesService.findOne(
      data.id,
      data.user_id,
    );
    return { workspace: mapWorkspaceToGrpc(workspace) };
  }

  @GrpcMethod('WorkspaceService', 'CreateWorkspace')
  async createWorkspace(
    data: CreateWorkspaceRequest,
  ): Promise<CreateWorkspaceResponse> {
    const workspace = await this.workspacesService.create(data.user_id, {
      workspaceName: data.workspace_name,
      description: data.description,
    });
    return { workspace: mapWorkspaceToGrpc(workspace) };
  }

  @GrpcMethod('WorkspaceService', 'UpdateWorkspace')
  async updateWorkspace(
    data: UpdateWorkspaceRequest,
  ): Promise<UpdateWorkspaceResponse> {
    const workspace = await this.workspacesService.update(
      data.id,
      data.user_id,
      {
        workspaceName: data.workspace_name,
        description: data.description,
      },
    );
    return { workspace: mapWorkspaceToGrpc(workspace) };
  }

  @GrpcMethod('WorkspaceService', 'DeleteWorkspace')
  async deleteWorkspace(
    data: DeleteWorkspaceRequest,
  ): Promise<DeleteWorkspaceResponse> {
    await this.workspacesService.remove(data.id, data.user_id);
    return { message: 'Workspace deleted successfully' };
  }
}
