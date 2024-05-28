import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class FileUploadService {
  constructor() {
    // Ensure the uploads directory exists
    const uploadDir = join(__dirname, '..', '..', 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir);
    }
  }
  // Method to handle file upload logic if needed
  handleFileUpload(file: any) {
    // Implement any additional file handling logic here
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
    };
  }
}
