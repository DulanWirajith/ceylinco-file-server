import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
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
  handleUpload(@UploadedFile() file: Express.Multer.File, @Body() body) {
    return {
      file,
    };
  }

  @Get('/file-retrieve/:fileId')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="package.json"')
  getStaticFile(@Param('fileId') id: string): StreamableFile {
    console.log('in file retrieve');
    const file = createReadStream(
      join(
        process.cwd(),
        `./../uploads/virtual-assessor/2023/3c14ff78-f87f-4663-a2c7-69619915fcc2/${id}`,
      ),
    );
    return new StreamableFile(file);
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
