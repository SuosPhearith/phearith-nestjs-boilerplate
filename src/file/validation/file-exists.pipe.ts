import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileExistsPipe implements PipeTransform {
  transform(file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return file;
  }
}
