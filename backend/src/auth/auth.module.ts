import { Module } from '@nestjs/common';
import { AppStore } from '../common/store/app.store';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AppStore],
  exports: [AuthService, AppStore],
})
export class AuthModule {}
