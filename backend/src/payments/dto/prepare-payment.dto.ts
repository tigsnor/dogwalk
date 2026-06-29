import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class PreparePaymentDto {
  @IsUUID()
  walkSessionId!: string;

  @IsIn(['card', 'easy-pay', 'offline-pos'])
  provider!: 'card' | 'easy-pay' | 'offline-pos';

  @IsInt()
  @Min(1000)
  @Max(500000)
  amountTotal!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  creditUsed?: number;
}
