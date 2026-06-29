import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, NotEquals } from 'class-validator';

export class AdminAdjustCreditDto {
  @IsUUID()
  userId!: string;

  @IsInt()
  @NotEquals(0)
  @Min(-1000000)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  memo?: string;
}
