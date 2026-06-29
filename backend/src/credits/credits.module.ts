import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../common/db/database.module';
import { CreditsRepository } from './credits.repository';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [CreditsController],
  providers: [CreditsService, CreditsRepository],
  exports: [CreditsService, CreditsRepository],
})
export class CreditsModule {}
