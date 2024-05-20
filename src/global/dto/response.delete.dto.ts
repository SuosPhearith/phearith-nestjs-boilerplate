import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ResponseDeleteDTO {
  @IsNotEmpty()
  @IsString()
  readonly message: string;

  @IsNotEmpty()
  @IsNumber()
  readonly statusCode: number;
}
