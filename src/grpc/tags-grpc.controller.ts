import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TagsService } from '../pms/tags/tags.service';
import { toGrpcPaginationResponse } from './utils';

@Controller()
export class TagsGrpcController {
  constructor(private tagsService: TagsService) {}

  @GrpcMethod('TagService', 'ListTags')
  async listTags(data: any): Promise<any> {
    const result = await this.tagsService.findAll(
      {
        page: data.page || 1,
        limit: data.limit || 50,
        search: data.search,
        visibility: data.visibility,
        creatorId: data.creator_id,
      },
      data.user_id,
    );
    return {
      tags: result.data.map((tag) => ({
        id: tag.id,
        tag_name: tag.tagName,
        color: tag.color,
        creator_id: tag.creatorId,
        visibility: tag.visibility,
        usage_count: tag.usageCount,
        created_at: tag.createdAt.toISOString(),
        updated_at: tag.updatedAt.toISOString(),
        creator: tag.creator
          ? {
              id: tag.creator.id,
              email: tag.creator.email,
              first_name: tag.creator.firstName,
              last_name: tag.creator.lastName,
            }
          : undefined,
      })),
      pagination: toGrpcPaginationResponse(result.pagination),
    };
  }

  @GrpcMethod('TagService', 'GetTag')
  async getTag(data: any): Promise<any> {
    const tag = await this.tagsService.findOne(data.id, data.user_id);
    return {
      tag: {
        id: tag.id,
        tag_name: tag.tagName,
        color: tag.color,
        creator_id: tag.creatorId,
        visibility: tag.visibility,
        usage_count: tag.usageCount,
        created_at: tag.createdAt.toISOString(),
        updated_at: tag.updatedAt.toISOString(),
        creator: tag.creator
          ? {
              id: tag.creator.id,
              email: tag.creator.email,
              first_name: tag.creator.firstName,
              last_name: tag.creator.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('TagService', 'CreateTag')
  async createTag(data: any): Promise<any> {
    const tag = await this.tagsService.create(data.user_id, {
      tagName: data.tag_name,
      color: data.color,
      visibility: data.visibility,
    });
    return {
      tag: {
        id: tag.id,
        tag_name: tag.tagName,
        color: tag.color,
        creator_id: tag.creatorId,
        visibility: tag.visibility,
        usage_count: tag.usageCount,
        created_at: tag.createdAt.toISOString(),
        updated_at: tag.updatedAt.toISOString(),
        creator: tag.creator
          ? {
              id: tag.creator.id,
              email: tag.creator.email,
              first_name: tag.creator.firstName,
              last_name: tag.creator.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('TagService', 'UpdateTag')
  async updateTag(data: any): Promise<any> {
    const tag = await this.tagsService.update(data.id, data.user_id, {
      tagName: data.tag_name,
      color: data.color,
      visibility: data.visibility,
    });
    return {
      tag: {
        id: tag.id,
        tag_name: tag.tagName,
        color: tag.color,
        creator_id: tag.creatorId,
        visibility: tag.visibility,
        usage_count: tag.usageCount,
        created_at: tag.createdAt.toISOString(),
        updated_at: tag.updatedAt.toISOString(),
        creator: tag.creator
          ? {
              id: tag.creator.id,
              email: tag.creator.email,
              first_name: tag.creator.firstName,
              last_name: tag.creator.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('TagService', 'DeleteTag')
  async deleteTag(data: any): Promise<any> {
    await this.tagsService.remove(data.id, data.user_id);
    return { message: 'Tag deleted successfully' };
  }

  @GrpcMethod('TagService', 'AddTagging')
  async addTagging(data: any): Promise<any> {
    const tagging = await this.tagsService.addTagging(data.user_id, {
      tagId: data.tag_id,
      taggableType: data.taggable_type,
      taggableId: data.taggable_id,
    });
    return {
      tagging: {
        id: tagging.id,
        tag_id: tagging.tagId,
        taggable_type: tagging.taggableType,
        taggable_id: tagging.taggableId,
        created_by_id: tagging.createdById,
        created_at: tagging.createdAt.toISOString(),
        tag: tagging.tag
          ? {
              id: tagging.tag.id,
              tag_name: tagging.tag.tagName,
              color: tagging.tag.color,
            }
          : undefined,
        created_by: tagging.createdBy
          ? {
              id: tagging.createdBy.id,
              email: tagging.createdBy.email,
              first_name: tagging.createdBy.firstName,
              last_name: tagging.createdBy.lastName,
            }
          : undefined,
      },
    };
  }

  @GrpcMethod('TagService', 'RemoveTagging')
  async removeTagging(data: any): Promise<any> {
    await this.tagsService.removeTagging(
      data.tag_id,
      data.taggable_type,
      data.taggable_id,
      data.user_id,
    );
    return { message: 'Tagging removed successfully' };
  }

  @GrpcMethod('TagService', 'GetTaggings')
  async getTaggings(data: any): Promise<any> {
    const taggings = await this.tagsService.getTaggings(
      data.taggable_type,
      data.taggable_id,
      data.user_id,
    );
    return {
      taggings: taggings.map((tagging) => ({
        id: tagging.id,
        tag_id: tagging.tagId,
        taggable_type: tagging.taggableType,
        taggable_id: tagging.taggableId,
        created_by_id: tagging.createdById,
        created_at: tagging.createdAt.toISOString(),
        tag: tagging.tag
          ? {
              id: tagging.tag.id,
              tag_name: tagging.tag.tagName,
              color: tagging.tag.color,
            }
          : undefined,
        created_by: tagging.createdBy
          ? {
              id: tagging.createdBy.id,
              email: tagging.createdBy.email,
              first_name: tagging.createdBy.firstName,
              last_name: tagging.createdBy.lastName,
            }
          : undefined,
      })),
    };
  }
}
