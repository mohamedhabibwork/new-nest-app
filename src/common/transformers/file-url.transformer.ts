import { Transform } from 'class-transformer';
import { ConfigService } from '@nestjs/config';

export function TransformFileUrl(configService?: ConfigService) {
  return Transform(({ value, obj }) => {
    if (!value) {
      return value;
    }

    // If already a full URL, return as is
    if (typeof value === 'string' && value.startsWith('http')) {
      return value;
    }

    // If fileUrl exists, use it
    if (obj?.fileUrl) {
      return obj.fileUrl;
    }

    // Otherwise, construct URL from filePath
    if (obj?.filePath && configService) {
      const baseUrl = configService.get('APP_URL') || 'http://localhost:3000';
      const storageType = obj?.storageType || 'local';
      
      if (storageType === 's3') {
        return obj.fileUrl || value;
      }
      
      return `${baseUrl}/files/${obj.id}/download`;
    }

    return value;
  });
}

