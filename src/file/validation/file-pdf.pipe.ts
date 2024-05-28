import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { File as MulterFile } from 'multer';

@Injectable()
export class FilePdfPipe implements PipeTransform {
  private readonly maxFileSize = 100 * 1024 * 1024; // 100 MB

  transform(file: MulterFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check if the file is a PDF
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Invalid file type. Only PDF is allowed.');
    }

    // Check if the file size is within the limit
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        'File too large. Maximum size allowed is 100MB.',
      );
    }

    return file;
  }
}
