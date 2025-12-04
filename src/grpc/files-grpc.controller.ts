import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FilesService } from '../files/files.service';
import type {
  ListFilesRequest,
  ListFilesResponse,
  GetFileRequest,
  GetFileResponse,
  DeleteFileRequest,
  DeleteFileResponse,
  MoveFileRequest,
  MoveFileResponse,
} from './types';
import { mapFileToGrpc, toGrpcPaginationResponse } from './utils';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';

@Controller()
export class FilesGrpcController {
  constructor(private filesService: FilesService) {}

  @GrpcMethod('FileService', 'ListFiles')
  async listFiles(data: ListFilesRequest): Promise<ListFilesResponse> {
    const result = await this.filesService.listFiles(
      data.entity_type,
      data.entity_id,
      data.user_id,
      data.page || 1,
      data.limit || 50,
    );
    // Convert pagination to PaginationMetaDto format
    const paginationMeta: PaginationMetaDto = {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
      hasNext: result.pagination.page < result.pagination.totalPages,
      hasPrevious: result.pagination.page > 1,
    };
    return {
      files: result.files.map(mapFileToGrpc),
      pagination: toGrpcPaginationResponse(paginationMeta),
    };
  }

  @GrpcMethod('FileService', 'GetFile')
  async getFile(data: GetFileRequest): Promise<GetFileResponse> {
    const file = await this.filesService.getFile(data.id, data.user_id);
    return { file: mapFileToGrpc(file) };
  }

  @GrpcMethod('FileService', 'UploadFile')
  async uploadFile(): Promise<{ message: string }> {
    // Note: gRPC file upload would need special handling for binary data
    // This is a simplified version - in production, you'd use streaming
    throw new Error('File upload via gRPC not fully implemented - use REST API');
  }

  @GrpcMethod('FileService', 'DeleteFile')
  async deleteFile(data: DeleteFileRequest): Promise<DeleteFileResponse> {
    await this.filesService.deleteFile(data.id, data.user_id);
    return { message: 'File deleted successfully' };
  }

  @GrpcMethod('FileService', 'MoveFile')
  async moveFile(data: MoveFileRequest): Promise<MoveFileResponse> {
    const file = await this.filesService.moveFile(
      data.id,
      data.entity_type,
      data.entity_id,
      data.user_id,
    );
    return { file: mapFileToGrpc(file) };
  }
}

