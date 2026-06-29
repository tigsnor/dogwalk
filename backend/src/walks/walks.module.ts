import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../common/db/database.module';
import { DogsModule } from '../dogs/dogs.module';
import { WalksController } from './walks.controller';
import { WalksRepository } from './walks.repository';
import { WalksService } from './walks.service';

@Module({
  imports: [AuthModule, DatabaseModule, DogsModule],
  controllers: [WalksController],
  providers: [WalksService, WalksRepository],
  exports: [WalksRepository],
})
export class WalksModule {}
