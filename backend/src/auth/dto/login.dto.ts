import { IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('KR')
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
