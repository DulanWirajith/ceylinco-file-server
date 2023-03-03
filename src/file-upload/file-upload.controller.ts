import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { FileUploadService } from './file-upload.service';
import { UpdateFileUploadDto } from './dto/update-file-upload.dto';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('/file/:caseId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // destination: (req, file, callback) => {
        //   const { caseId } = req.params;
        //   const path = `./uploads/2023/${caseId}`;
        //   fs.mkdirSync(path);
        //   callback(null, path);
        // },
        // destination(req, file, cb) {
        //   const dir = `../../../../../../../../../var/va-uploaded-files/${req.params.caseId}`;
        //
        //   if (!fs.existsSync(dir)) {
        //     fs.chmodSync(dir, '0777');
        //     fs.mkdirSync(dir);
        //     fs.chmodSync(dir, '0777');
        //   }
        //   cb(
        //     null,
        //     `../../../../../../../../../var/va-uploaded-files/${req.params.caseId}`,
        //   );
        // },

        destination(req, file, cb) {
          const dir = `./../uploads/${req.params.caseId}`;
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          cb(null, `./../uploads/${req.params.caseId}`);
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
  handleUpload(@UploadedFile() file: Express.Multer.File) {
    return {
      file,
    };
  }

  @Get()
  findAll() {
    return this.fileUploadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileUploadService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFileUploadDto: UpdateFileUploadDto,
  ) {
    return this.fileUploadService.update(+id, updateFileUploadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileUploadService.remove(+id);
  }
}
