import { IsEmail, IsNotEmpty } from 'class-validator';

export class SingInDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;

  @IsNotEmpty()
  readonly userAgent: string;
}
