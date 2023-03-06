import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { UpdateFileUploadDto } from './dto/update-file-upload.dto';
import { PrismaService } from '../prisma.service';
import { join } from 'path';
import fs from 'fs';
import { createReadStream, readFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

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

  // for download file
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

  // archive
  async downloadImage() {
    console.log(
      join(
        process.cwd(),
        './../uploads/virtual-assessor/2023/3c14ff78-f87f-4663-a2c7-69619915fcc2/1678074194577-88397174.png',
      ),
    );
    const writer = fs.createWriteStream(
      join(
        process.cwd(),
        './../uploads/virtual-assessor/2023/3c14ff78-f87f-4663-a2c7-69619915fcc2/1678074194577-88397174.png',
      ),
    );

    const response = await this.httpService.axiosRef({
      url: 'https://example.com/image.png',
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  readImageOrVideo(fileId: string) {
    return this.prismaService.file
      .findUnique({
        where: {
          id: fileId,
        },
      })
      .then((fileDetails) => {
        return readFileSync(
          join(
            process.cwd(),
            `./../uploads/${fileDetails.projectName}/${fileDetails.year}/${fileDetails.uniqueLocation}/${fileDetails.fileName}`,
          ),
        );
      });

    // return readFileSync(
    //   join(
    //     // process.cwd(),
    //     './../uploads/virtual-assessor/2023/3c14ff78-f87f-4663-a2c7-69619915fcc2/1678074194577-88397174.png',
    //   ),
    // );
  }
}
