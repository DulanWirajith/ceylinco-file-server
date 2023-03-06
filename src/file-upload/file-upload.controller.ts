import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { createReadStream } from 'fs';
import { FileUploadService } from './file-upload.service';
import { UpdateFileUploadDto } from './dto/update-file-upload.dto';
import { join } from 'path';
import { Response } from 'express';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('/file/project/:projectName/year/:year/folder/:uniqueId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination(req, file, cb) {
          const dir = `./../uploads/${req.params.projectName}/${req.params.year}/${req.params.uniqueId}`;
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          cb(null, dir);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  handleUpload(
    @UploadedFile() file: Express.Multer.File,
    @Param('projectName') projectName: string,
    @Param('year') year: string,
    @Param('uniqueId') uniqueId: string,
  ) {
    return this.fileUploadService.storeFileDetailsInDB(
      file,
      projectName,
      year,
      uniqueId,
    );
  }

  @Get('/file-retrieve/:fileId')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="package.json"')
  getStaticFile(@Param('fileId') id: string): Promise<StreamableFile> {
    return this.fileUploadService.fileRetrieve(id);
  }

  @Get('/download-image')
  downloadImage() {
    return this.fileUploadService.downloadImage();
  }

  @Get('buffer-image/:fileId')
  async bufferImage(
    @Param('fileId') fileId: string,
    @Res() response: Response,
  ) {
    const file = await this.fileUploadService.readImageOrVideo(fileId);
    response.contentType('image/png');
    response.attachment();
    response.send(file);
  }

  @Get('buffer-video/:fileId')
  async bufferVideo(
    @Param('fileId') fileId: string,
    @Res() response: Response,
  ) {
    const file = await this.fileUploadService.readImageOrVideo(fileId);
    response.contentType('video/mp4');
    response.attachment();
    response.send(file);
  }
}
