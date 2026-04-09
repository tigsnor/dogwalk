import { IsString, MinLength } from 'class-validator';

export class SignUpWalkerDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  certificateType!: string;
}
