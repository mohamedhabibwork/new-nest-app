export interface FileUploadResult {
  filePath: string;
  fileUrl: string;
  fileSize: number;
}

export interface IStorageService {
  /**
   * Upload a file
   */
  uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    entityType: string,
    entityId: string,
  ): Promise<FileUploadResult>;

  /**
   * Get file URL
   */
  getFileUrl(filePath: string): Promise<string>;

  /**
   * Delete a file
   */
  deleteFile(filePath: string): Promise<void>;

  /**
   * Check if file exists
   */
  fileExists(filePath: string): Promise<boolean>;

  /**
   * Get file stream for download
   */
  getFileStream(filePath: string): Promise<NodeJS.ReadableStream>;
}
