import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import { Readable } from 'stream';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: jest.Mocked<FilesService>;

  const mockFilesService = {
    uploadFile: jest.fn(),
    getFile: jest.fn(),
    getFileStream: jest.fn(),
    deleteFile: jest.fn(),
    moveFile: jest.fn(),
    listFiles: jest.fn(),
    getFileSize: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test content'),
      destination: '',
      filename: 'test.pdf',
      path: '',
      stream: null as any,
    };

    const uploadDto: UploadFileDto = {
      entityType: 'task',
      entityId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      metadata: { key: 'value' },
    };

    it('should upload file successfully', async () => {
      const mockAttachment = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        entityType: 'task',
        entityId: uploadDto.entityId,
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        uploadedBy: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      filesService.uploadFile.mockResolvedValue(mockAttachment);

      const result = await controller.uploadFile(mockFile, uploadDto, mockRequest);

      expect(filesService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        uploadDto.entityType,
        uploadDto.entityId,
        mockRequest.user.id,
        uploadDto.metadata,
      );
      expect(result).toEqual(mockAttachment);
    });

    it('should upload file with null metadata', async () => {
      const uploadDtoNullMetadata: UploadFileDto = {
        entityType: 'task',
        entityId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        metadata: null,
      };

      const mockAttachment = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        entityType: 'task',
        entityId: uploadDtoNullMetadata.entityId,
        fileName: 'test.pdf',
        metadata: null,
        uploadedBy: mockRequest.user.id,
        createdAt: new Date(),
      };

      filesService.uploadFile.mockResolvedValue(mockAttachment);

      const result = await controller.uploadFile(mockFile, uploadDtoNullMetadata, mockRequest);

      expect(filesService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        uploadDtoNullMetadata.entityType,
        uploadDtoNullMetadata.entityId,
        mockRequest.user.id,
        null,
      );
      expect(result).toEqual(mockAttachment);
    });

    it('should upload file without metadata', async () => {
      const uploadDtoNoMetadata: UploadFileDto = {
        entityType: 'task',
        entityId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      };

      const mockAttachment = {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        entityType: 'task',
        entityId: uploadDtoNoMetadata.entityId,
        fileName: 'test.pdf',
        uploadedBy: mockRequest.user.id,
        createdAt: new Date(),
      };

      filesService.uploadFile.mockResolvedValue(mockAttachment);

      const result = await controller.uploadFile(mockFile, uploadDtoNoMetadata, mockRequest);

      expect(filesService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        uploadDtoNoMetadata.entityType,
        uploadDtoNoMetadata.entityId,
        mockRequest.user.id,
        undefined,
      );
      expect(result).toEqual(mockAttachment);
    });
  });

  describe('getFile', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const fileId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should return file metadata', async () => {
      const mockFile = {
        id: fileId,
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        uploadedBy: mockRequest.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      filesService.getFile.mockResolvedValue(mockFile);

      const result = await controller.getFile(fileId, mockRequest);

      expect(filesService.getFile).toHaveBeenCalledWith(fileId, mockRequest.user.id);
      expect(result).toEqual(mockFile);
    });

    it('should throw NotFoundException when file not found', async () => {
      filesService.getFile.mockRejectedValue(new NotFoundException('File not found'));

      await expect(controller.getFile(fileId, mockRequest)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      filesService.getFile.mockRejectedValue(
        new ForbiddenException('No access to file'),
      );

      await expect(controller.getFile(fileId, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('downloadFile', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const mockResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const fileId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should download file successfully', async () => {
      const mockStream = new Readable();

      const mockFileInfo = {
        stream: mockStream,
        fileName: 'test.pdf',
        fileType: 'application/pdf',
      };

      filesService.getFileStream.mockResolvedValue(mockFileInfo);
      filesService.getFileSize.mockResolvedValue(1024);

      const result = await controller.downloadFile(fileId, mockRequest, mockResponse);

      expect(filesService.getFileStream).toHaveBeenCalledWith(fileId, mockRequest.user.id);
      expect(filesService.getFileSize).toHaveBeenCalledWith(fileId, mockRequest.user.id);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.any(String));
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Length', '1024');
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should throw NotFoundException when file not found', async () => {
      filesService.getFileStream.mockRejectedValue(new NotFoundException('File not found'));

      await expect(
        controller.downloadFile(fileId, mockRequest, mockResponse),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFile', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const fileId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

    it('should delete file successfully', async () => {
      filesService.deleteFile.mockResolvedValue({
        message: 'File deleted successfully',
      });

      const result = await controller.deleteFile(fileId, mockRequest);

      expect(filesService.deleteFile).toHaveBeenCalledWith(fileId, mockRequest.user.id);
      expect(result).toEqual({ message: 'File deleted successfully' });
    });

    it('should throw NotFoundException when file not found', async () => {
      filesService.deleteFile.mockRejectedValue(new NotFoundException('File not found'));

      await expect(controller.deleteFile(fileId, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user has no access', async () => {
      filesService.deleteFile.mockRejectedValue(
        new ForbiddenException('No access to file'),
      );

      await expect(controller.deleteFile(fileId, mockRequest)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('moveFile', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    const fileId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
    const moveBody = {
      entityType: 'project',
      entityId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    };

    it('should move file successfully', async () => {
      const mockFile = {
        id: fileId,
        entityType: moveBody.entityType,
        entityId: moveBody.entityId,
        fileName: 'test.pdf',
        updatedAt: new Date(),
      };

      filesService.moveFile.mockResolvedValue(mockFile);

      const result = await controller.moveFile(fileId, moveBody, mockRequest);

      expect(filesService.moveFile).toHaveBeenCalledWith(
        fileId,
        moveBody.entityType,
        moveBody.entityId,
        mockRequest.user.id,
      );
      expect(result).toEqual(mockFile);
    });

    it('should throw NotFoundException when file not found', async () => {
      filesService.moveFile.mockRejectedValue(new NotFoundException('File not found'));

      await expect(controller.moveFile(fileId, moveBody, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when moving to same entity', async () => {
      filesService.moveFile.mockRejectedValue(
        new BadRequestException('File is already attached to this entity'),
      );

      await expect(controller.moveFile(fileId, moveBody, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('listFiles', () => {
    const mockRequest = {
      user: {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      },
    };

    it('should return paginated files', async () => {
      const entityType = 'task';
      const entityId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
      const page = 1;
      const limit = 50;

      const mockFiles = [
        {
          id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          entityType,
          entityId,
          fileName: 'test.pdf',
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        data: mockFiles,
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      filesService.listFiles.mockResolvedValue(mockResponse);

      const result = await controller.listFiles(entityType, entityId, page, limit, mockRequest);

      expect(filesService.listFiles).toHaveBeenCalledWith(
        entityType,
        entityId,
        mockRequest.user.id,
        page,
        limit,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

