import { IsString, MinLength } from 'class-validator';

export class SignUpOwnerDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
