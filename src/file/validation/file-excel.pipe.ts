import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { File as MulterFile } from 'multer';

@Injectable()
export class FileExcelPipe implements PipeTransform {
  private readonly allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];
  private readonly maxFileSize = 200 * 1024 * 1024; // 200 MB

  transform(file: MulterFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check if the file is an Excel file
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only Excel files are allowed.',
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
