import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RunSettlementsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  batchLabel?: string;
}
