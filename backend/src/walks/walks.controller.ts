import { Controller, Get } from '@nestjs/common';
import { WalksService } from './walks.service';

@Controller()
export class WalksController {
  constructor(private readonly walksService: WalksService) {}

  @Get('walk-requests')
  getRequests() {
    return this.walksService.getRequests();
  }
}
