import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { File as MulterFile } from 'multer';

@Injectable()
export class FileAudioPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  private readonly maxFileSize = 50 * 1024 * 1024; // 50 MB

  transform(file: MulterFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check if the file is an audio file
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only audio files are allowed.',
      );
    }

    // Check if the file size is within the limit
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        'File too large. Maximum size allowed is 50MB.',
      );
    }

    return file;
  }
}
