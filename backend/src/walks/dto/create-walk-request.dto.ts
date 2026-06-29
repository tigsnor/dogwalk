import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateWalkRequestDto {
  @IsUUID()
  dogId!: string;

  @IsISO8601()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  requestNote?: string;
}
