import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { File as MulterFile } from 'multer';

@Injectable()
export class FileImagePipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  private readonly maxFileSize = 20 * 1024 * 1024; // 20 MB

  transform(file: MulterFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check if the file is an image
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
      );
    }

    // Check if the file size is within the limit
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        'File too large. Maximum size allowed is 20MB.',
      );
    }

    return file;
  }
}
