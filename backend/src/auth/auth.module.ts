import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/db/database.module';
import { AppStore } from '../common/store/app.store';
import { DbStateService } from '../common/store/db-state.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, DbStateService, AppStore],
  exports: [AuthService, AppStore],
})
export class AuthModule {}
