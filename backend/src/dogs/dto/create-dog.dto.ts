import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDogDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  breed?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  animalRegistrationNo?: string;
}
