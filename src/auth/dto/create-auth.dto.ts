import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '../enum/gender.enum';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  readonly name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  readonly password: string;

  @IsNotEmpty()
  @IsNumber()
  readonly roleId: number;

  @IsOptional()
  @IsString()
  readonly avatar?: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  readonly gender: Gender;
}
