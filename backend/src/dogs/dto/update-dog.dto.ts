import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDogDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  breed?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  animalRegistrationNo?: string;
}
