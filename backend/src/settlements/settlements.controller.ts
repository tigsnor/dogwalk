import { Controller, Get } from '@nestjs/common';
import { SettlementsService } from './settlements.service';

@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get('me')
  mine() {
    return this.settlementsService.mine();
  }
}
