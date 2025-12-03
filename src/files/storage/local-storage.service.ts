import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService, FileUploadResult } from './storage.interface';
import { createWriteStream, createReadStream, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { generateUlid } from '../../common/utils/ulid.util';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('UPLOAD_DIR') ||
      join(process.cwd(), 'uploads');
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    entityType: string,
    entityId: string,
  ): Promise<FileUploadResult> {
    // Create directory structure: uploads/entityType/entityId/
    const entityDir = join(this.uploadDir, entityType, entityId);
    await mkdir(entityDir, { recursive: true });

    // Generate unique filename
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${generateUlid()}.${fileExtension}`;
    const filePath = join(entityDir, uniqueFileName);

    // Write file
    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(filePath);
      stream.write(file);
      stream.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Generate public URL
    const baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/files/${entityType}/${entityId}/${uniqueFileName}`;

    return {
      filePath: filePath.replace(process.cwd(), '').replace(/^\//, ''),
      fileUrl,
      fileSize: file.length,
    };
  }

  async getFileUrl(filePath: string): Promise<string> {
    const baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    return `${baseUrl}/files/${filePath}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = join(process.cwd(), filePath);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = join(process.cwd(), filePath);
    return existsSync(fullPath);
  }

  async getFileStream(filePath: string): Promise<NodeJS.ReadableStream> {
    const fullPath = join(process.cwd(), filePath);
    return createReadStream(fullPath);
  }
}

