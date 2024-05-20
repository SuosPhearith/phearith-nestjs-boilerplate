import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class ResponseCreateOrUpdateDTO {
  @IsNotEmpty()
  @IsObject()
  readonly data: object;

  @IsNotEmpty()
  @IsString()
  readonly message: string;

  @IsNotEmpty()
  @IsNumber()
  readonly statusCode: number;
}
