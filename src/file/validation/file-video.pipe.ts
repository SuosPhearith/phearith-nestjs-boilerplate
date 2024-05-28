import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { File as MulterFile } from 'multer';

@Injectable()
export class FileVideoPipe implements PipeTransform {
  private readonly allowedMimeTypes = [
    'video/mp4',
    'video/x-msvideo', // .avi
    'video/mpeg', // .mpeg
    'video/mkv', // .mkv
    // Add more video MIME types as needed
  ];
  private readonly maxFileSize = 200 * 1024 * 1024; // 200 MB

  transform(file: MulterFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check if the file is a video
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only video files are allowed.',
      );
    }

    // Check if the file size is within the limit
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        'File too large. Maximum size allowed is 200MB.',
      );
    }

    return file;
  }
}
