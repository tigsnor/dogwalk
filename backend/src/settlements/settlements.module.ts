import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { DatabaseModule } from '../common/db/database.module';
import { WalksModule } from '../walks/walks.module';
import { SettlementsRepository } from './settlements.repository';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './settlements.service';

@Module({
  imports: [AuthModule, PaymentsModule, WalksModule, DatabaseModule],
  controllers: [SettlementsController],
  providers: [SettlementsService, SettlementsRepository],
})
export class SettlementsModule {}
