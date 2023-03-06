import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { PrismaService } from '../prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [FileUploadController],
  providers: [FileUploadService, PrismaService],
})
export class FileUploadModule {}
