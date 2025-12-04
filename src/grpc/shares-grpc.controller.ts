import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SharesService } from '../pms/shares/shares.service';
import { toGrpcPaginationResponse } from './utils';

@Controller()
export class SharesGrpcController {
  constructor(private sharesService: SharesService) {}

  @GrpcMethod('ShareService', 'ListShares')
  async listShares(data: any): Promise<any> {
    const result = await this.sharesService.findAll(
      {
        page: data.page || 1,
        limit: data.limit || 50,
        shareableType: data.shareable_type,
        shareableId: data.shareable_id,
        sharedWithType: data.shared_with_type,
        sharedWithId: data.shared_with_id,
        permission: data.permission,
      },
      data.user_id,
    );
    return {
      shares: result.data.map((share) => ({
        id: share.id,
        shareable_type: share.shareableType,
        shareable_id: share.shareableId,
        shared_with_type: share.sharedWithType,
        shared_with_id: share.sharedWithId,
        permission: share.permission,
        shared_by_id: share.sharedById,
        expires_at: share.expiresAt?.toISOString(),
        created_at: share.createdAt.toISOString(),
        updated_at: share.updatedAt.toISOString(),
        shared_by: share.sharedBy
          ? {
              id: share.sharedBy.id,
              email: share.sharedBy.email,
              first_name: share.sharedBy.firstName,
              last_name: share.sharedBy.lastName,
            }
          : undefined,
      })),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }

  @GrpcMethod('ShareService', 'GetShare')
  async getShare(data: any): Promise<any> {
    const share = await this.sharesService.findOne(data.id, data.user_id);
    return {
      share: {
        id: share.id,
        shareable_type: share.shareableType,
        shareable_id: share.shareableId,
        shared_with_type: share.sharedWithType,
        shared_with_id: share.sharedWithId,
        permission: share.permission,
        shared_by_id: share.sharedById,
        expires_at: share.expiresAt?.toISOString(),
        created_at: share.createdAt.toISOString(),
        updated_at: share.updatedAt.toISOString(),
        shared_by: share.sharedBy
          ? {
              id: share.sharedBy.id,
              email: share.sharedBy.email,
              first_name: share.sharedBy.firstName,
              last_name: share.sharedBy.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('ShareService', 'CreateShare')
  async createShare(data: any): Promise<any> {
    const share = await this.sharesService.create(data.user_id, {
      shareableType: data.shareable_type,
      shareableId: data.shareable_id,
      sharedWithType: data.shared_with_type,
      sharedWithId: data.shared_with_id,
      permission: data.permission,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    });
    return {
      share: {
        id: share.id,
        shareable_type: share.shareableType,
        shareable_id: share.shareableId,
        shared_with_type: share.sharedWithType,
        shared_with_id: share.sharedWithId,
        permission: share.permission,
        shared_by_id: share.sharedById,
        expires_at: share.expiresAt?.toISOString(),
        created_at: share.createdAt.toISOString(),
        updated_at: share.updatedAt.toISOString(),
        shared_by: share.sharedBy
          ? {
              id: share.sharedBy.id,
              email: share.sharedBy.email,
              first_name: share.sharedBy.firstName,
              last_name: share.sharedBy.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('ShareService', 'UpdateShare')
  async updateShare(data: any): Promise<any> {
    const share = await this.sharesService.update(data.id, data.user_id, {
      permission: data.permission,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    });
    return {
      share: {
        id: share.id,
        shareable_type: share.shareableType,
        shareable_id: share.shareableId,
        shared_with_type: share.sharedWithType,
        shared_with_id: share.sharedWithId,
        permission: share.permission,
        shared_by_id: share.sharedById,
        expires_at: share.expiresAt?.toISOString(),
        created_at: share.createdAt.toISOString(),
        updated_at: share.updatedAt.toISOString(),
        shared_by: share.sharedBy
          ? {
              id: share.sharedBy.id,
              email: share.sharedBy.email,
              first_name: share.sharedBy.firstName,
              last_name: share.sharedBy.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('ShareService', 'DeleteShare')
  async deleteShare(data: any): Promise<any> {
    await this.sharesService.remove(data.id, data.user_id);
    return { message: 'Share removed successfully' };
  }

  @GrpcMethod('ShareService', 'GetSharedContent')
  async getSharedContent(data: any): Promise<any> {
    const result = await this.sharesService.getSharedContent(
      data.user_id,
      data.page || 1,
      data.limit || 50,
    );
    return {
      shares: result.data.map((share) => ({
        id: share.id,
        shareable_type: share.shareableType,
        shareable_id: share.shareableId,
        shared_with_type: share.sharedWithType,
        shared_with_id: share.sharedWithId,
        permission: share.permission,
        shared_by_id: share.sharedById,
        expires_at: share.expiresAt?.toISOString(),
        created_at: share.createdAt.toISOString(),
        updated_at: share.updatedAt.toISOString(),
        shared_by: share.sharedBy
          ? {
              id: share.sharedBy.id,
              email: share.sharedBy.email,
              first_name: share.sharedBy.firstName,
              last_name: share.sharedBy.lastName,
            }
          : undefined,
      })),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }
}
