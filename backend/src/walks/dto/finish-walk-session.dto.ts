import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class FinishWalkSessionDto {
  @IsInt()
  @Min(1)
  @Max(200000)
  distanceM!: number;

  @IsInt()
  @Min(60)
  @Max(60 * 60 * 24)
  durationSec!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  memo?: string;
}
