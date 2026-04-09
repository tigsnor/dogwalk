import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DogsController } from './dogs.controller';
import { DogsService } from './dogs.service';

@Module({
  imports: [AuthModule],
  controllers: [DogsController],
  providers: [DogsService],
})
export class DogsModule {}
