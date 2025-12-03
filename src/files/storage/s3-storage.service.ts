import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService, FileUploadResult } from './storage.interface';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { generateUlid } from '../../common/utils/ulid.util';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey:
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    entityType: string,
    entityId: string,
  ): Promise<FileUploadResult> {
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${generateUlid()}.${fileExtension}`;
    const key = `${entityType}/${entityId}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);

    // Generate presigned URL or public URL
    const fileUrl = await this.getFileUrl(key);

    return {
      filePath: key,
      fileUrl,
      fileSize: file.length,
    };
  }

  async getFileUrl(filePath: string): Promise<string> {
    // Option 1: Use presigned URL (temporary, expires)
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    const expiresIn = 3600; // 1 hour
    const url = await getSignedUrl(this.s3Client, command, { expiresIn });

    // Option 2: Use public URL if bucket is public
    // const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filePath}`;

    return url;
  }

  async deleteFile(filePath: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    await this.s3Client.send(command);
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  async getFileStream(filePath: string): Promise<NodeJS.ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    const response = await this.s3Client.send(command);
    return response.Body as Readable;
  }
}

