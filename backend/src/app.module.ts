import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CreditsModule } from './credits/credits.module';
import { DogsModule } from './dogs/dogs.module';
import { PaymentsModule } from './payments/payments.module';
import { SettlementsModule } from './settlements/settlements.module';
import { UsersModule } from './users/users.module';
import { WalksModule } from './walks/walks.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DogsModule,
    WalksModule,
    PaymentsModule,
    SettlementsModule,
    CreditsModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
