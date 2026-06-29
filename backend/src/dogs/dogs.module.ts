import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../common/db/database.module';
import { DogsController } from './dogs.controller';
import { DogsRepository } from './dogs.repository';
import { DogsService } from './dogs.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [DogsController],
  providers: [DogsService, DogsRepository],
  exports: [DogsRepository],
})
export class DogsModule {}
