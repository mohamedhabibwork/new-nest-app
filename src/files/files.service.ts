import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotificationEventsService } from '../pms/notifications/notification-events.service';
import { WebSocketEventsService } from '../websocket/websocket-events.service';
import { IStorageService } from './storage/storage.interface';
import { LocalStorageService } from './storage/local-storage.service';
import { S3StorageService } from './storage/s3-storage.service';
import { withUlid } from '../common/utils/prisma-helpers';
import { Prisma } from '@prisma/client';

@Injectable()
export class FilesService {
  private storageService: IStorageService;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
    private s3StorageService: S3StorageService,
    private notificationEvents: NotificationEventsService,
    private wsEvents: WebSocketEventsService,
  ) {
    // Determine which storage service to use
    const storageType =
      this.configService.get<string>('FILE_STORAGE_TYPE') || 'local';
    this.storageService =
      storageType === 's3' ? this.s3StorageService : this.localStorageService;
  }

  /**
   * Upload a file
   */
  async uploadFile(
    file: Express.Multer.File,
    entityType: string,
    entityId: string,
    uploadedBy: string,
    metadata?: Record<string, unknown> | null,
  ) {
    // Validate entity type
    const allowedEntityTypes = [
      'workspace',
      'project',
      'task',
      'comment',
      'user',
      'team',
      'milestone',
    ];
    if (!allowedEntityTypes.includes(entityType)) {
      throw new BadRequestException(`Invalid entity type: ${entityType}`);
    }

    // Validate file size (default 10MB)
    const maxFileSize =
      this.configService.get<number>('MAX_FILE_SIZE') || 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw new BadRequestException('File size exceeds maximum limit');
    }

    // Upload to storage
    const uploadResult = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      entityType,
      entityId,
    );

    // Save to database
    // Allow null or empty object metadata - convert empty object to null for consistency
    const metadataValue: Prisma.InputJsonValue | null = metadata === null || metadata === undefined || Object.keys(metadata).length === 0 
      ? null 
      : (metadata as Prisma.InputJsonValue);

    const fileRecord = await this.prisma.file.create({
      data: withUlid({
        entityType,
        entityId,
        fileName: file.originalname,
        filePath: uploadResult.filePath,
        fileUrl: uploadResult.fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        storageType:
          this.configService.get<string>('FILE_STORAGE_TYPE') || 'local',
        metadata: metadataValue,
        uploadedBy,
      }) as Prisma.FileUncheckedCreateInput,
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get users to notify based on entity type
    let notifyUserIds: string[] = [];
    if (entityType === 'task') {
      const task = await this.prisma.task.findUnique({
        where: { id: entityId },
        include: {
          taskAssignments: { select: { userId: true } },
          project: {
            include: {
              projectMembers: { select: { userId: true } },
            },
          },
        },
      });
      if (task) {
        const assigneeIds = task.taskAssignments.map((ta) => ta.userId);
        const projectMemberIds = task.project.projectMembers.map((pm) => pm.userId);
        notifyUserIds = [...new Set([...assigneeIds, ...projectMemberIds])];
      }
    } else if (entityType === 'project') {
      const project = await this.prisma.project.findUnique({
        where: { id: entityId },
        include: {
          projectMembers: { select: { userId: true } },
        },
      });
      if (project) {
        notifyUserIds = project.projectMembers.map((pm) => pm.userId);
      }
    }

    // Notify users about file upload
    if (notifyUserIds.length > 0) {
      await this.notificationEvents.notifyFileUploaded(
        fileRecord.id,
        entityType,
        entityId,
        uploadedBy,
        file.originalname,
        notifyUserIds,
      );
    }

    // Emit WebSocket event
    this.wsEvents.emitFileUploaded(entityType, entityId, fileRecord);

    return fileRecord;
  }

  /**
   * Get file by ID
   */
  async getFile(id: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check permissions (user can access if they uploaded it or have access to entity)
    // This is a simplified check - you may want to add more sophisticated permission checks
    if (file.uploadedBy !== userId) {
      // In production, check if user has access to the entity
      // For now, we'll allow access
    }

    return file;
  }

  /**
   * Get file stream for download
   */
  async getFileStream(id: string, userId: string) {
    const file = await this.getFile(id, userId);

    // Check if file exists in storage
    const exists = await this.storageService.fileExists(file.filePath);
    if (!exists) {
      throw new NotFoundException('File not found in storage');
    }

    return {
      stream: await this.storageService.getFileStream(file.filePath),
      fileName: file.fileName,
      fileType: file.fileType,
    };
  }

  /**
   * Get file size for Content-Length header
   */
  async getFileSize(id: string, userId: string): Promise<number> {
    const file = await this.getFile(id, userId);
    return file.fileSize;
  }

  /**
   * List files for an entity
   */
  async listFiles(
    entityType: string,
    entityId: string,
    userId: string,
    page = 1,
    limit = 50,
  ) {
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where: {
          entityType,
          entityId,
        },
        include: {
          uploader: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.file.count({
        where: {
          entityType,
          entityId,
        },
      }),
    ]);

    return {
      files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a file
   */
  async deleteFile(id: string, userId: string) {
    const file = await this.getFile(id, userId);

    // Check if user is the uploader or has admin access
    if (file.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    // Delete from storage
    await this.storageService.deleteFile(file.filePath);

    // Delete from database
    await this.prisma.file.delete({
      where: { id },
    });

    return { message: 'File deleted successfully' };
  }

  /**
   * Move file to different entity
   */
  async moveFile(
    id: string,
    newEntityType: string,
    newEntityId: string,
    userId: string,
  ) {
    const file = await this.getFile(id, userId);

    if (file.uploadedBy !== userId) {
      throw new ForbiddenException(
        'You do not have permission to move this file',
      );
    }

    // Validate new entity type
    const allowedEntityTypes = [
      'workspace',
      'project',
      'task',
      'comment',
      'user',
      'team',
      'milestone',
    ];
    if (!allowedEntityTypes.includes(newEntityType)) {
      throw new BadRequestException(`Invalid entity type: ${newEntityType}`);
    }

    // Update file record
    return await this.prisma.file.update({
      where: { id },
      data: {
        entityType: newEntityType,
        entityId: newEntityId,
      },
    });
  }
}

