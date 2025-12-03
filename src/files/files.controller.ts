import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Readable } from 'stream';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('files')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'files', version: '1' })
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entityType: {
          type: 'string',
          example: 'task',
        },
        entityId: {
          type: 'string',
          example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        },
        metadata: {
          type: 'object',
          nullable: true,
          description: 'Additional metadata (can be null or empty object)',
          example: null,
        },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @Request() req: { user: { id: string } },
  ) {
    if (!file) {
      throw new Error('File is required');
    }

    return this.filesService.uploadFile(
      file,
      uploadDto.entityType,
      uploadDto.entityId,
      req.user.id,
      uploadDto.metadata,
    );
  }

  @ApiOperation({ summary: 'Get file information' })
  @ApiParam({ name: 'id', description: 'File ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'File information',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @Get(':id')
  async getFile(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.filesService.getFile(id, req.user.id);
  }

  @ApiOperation({ summary: 'Download a file' })
  @ApiParam({ name: 'id', description: 'File ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'File download',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @Get(':id/download')
  @Header('Content-Type', 'application/octet-stream')
  async downloadFile(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, fileName, fileType } = await this.filesService.getFileStream(
      id,
      req.user.id,
    );

    // Set proper headers for file download
    res.setHeader('Content-Type', fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Length', (await this.filesService.getFileSize(id, req.user.id)).toString());

    // Return StreamableFile for proper NestJS streaming
    // StreamableFile handles the streaming automatically
    // Ensure stream is a Readable instance
    return new StreamableFile(stream as Readable);
  }

  @ApiOperation({ summary: 'List files for an entity' })
  @ApiQuery({ name: 'entityType', description: 'Entity type', example: 'task', required: true })
  @ApiQuery({ name: 'entityId', description: 'Entity ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV', required: true })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of files with pagination',
  })
  @Get()
  async listFiles(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
    @Request() req: { user: { id: string } },
  ) {
    return this.filesService.listFiles(
      entityType,
      entityId,
      req.user.id,
      page,
      limit,
    );
  }

  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'id', description: 'File ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the file owner' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteFile(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.filesService.deleteFile(id, req.user.id);
  }

  @ApiOperation({ summary: 'Move file to different entity' })
  @ApiParam({ name: 'id', description: 'File ID', example: '01ARZ3NDEKTSV4RRFFQ69G5FAV' })
  @ApiResponse({
    status: 200,
    description: 'File moved successfully',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the file owner' })
  @Patch(':id/move')
  async moveFile(
    @Param('id') id: string,
    @Body() body: { entityType: string; entityId: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.filesService.moveFile(
      id,
      body.entityType,
      body.entityId,
      req.user.id,
    );
  }
}

