import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { UpdateFileUploadDto } from './dto/update-file-upload.dto';
import { PrismaService } from '../prisma.service';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class FileUploadService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createFileUploadDto: CreateFileUploadDto) {
    return 'This action adds a new fileUpload';
  }

  findAll() {
    return `This action returns all fileUpload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fileUpload`;
  }

  update(id: number, updateFileUploadDto: UpdateFileUploadDto) {
    return `This action updates a #${id} fileUpload`;
  }

  remove(id: number) {
    return `This action removes a #${id} fileUpload`;
  }

  async storeFileDetailsInDB(
    file: Express.Multer.File,
    projectName: string,
    year: string,
    uniqueId: string,
  ) {
    try {
      const fileDetails = await this.prismaService.file.create({
        data: {
          projectName,
          year,
          uniqueLocation: uniqueId,
          destination: file.destination,
          fileName: file.filename,
          path: file.path,
          fileOriginalName: file.originalname,
          encoding: file.encoding,
          mimeType: file.mimetype,
          size: file.size,
        },
      });
      return {
        file: file,
        id: fileDetails.id,
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async fileRetrieve(id: string): Promise<StreamableFile> {
    const fileDetails = await this.prismaService.file.findUnique({
      where: {
        id,
      },
    });
    const file = createReadStream(
      join(
        process.cwd(),
        `./../uploads/${fileDetails.projectName}/${fileDetails.year}/${fileDetails.uniqueLocation}/${fileDetails.fileName}`,
      ),
    );
    return new StreamableFile(file);
  }
}
