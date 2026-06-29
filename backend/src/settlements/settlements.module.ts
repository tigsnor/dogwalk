import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';

@Module({
  imports: [AuthModule, PaymentsModule],
  controllers: [SettlementsController],
  providers: [SettlementsService],
})
export class SettlementsModule {}
