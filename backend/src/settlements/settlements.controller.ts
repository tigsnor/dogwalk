import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';
import { RunSettlementsDto } from './dto/run-settlements.dto';
import { SettlementsService } from './settlements.service';

@Controller()
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get('settlements/me')
  @Roles('walker')
  mine(@CurrentUser() user: AuthUser) {
    return this.settlementsService.mine(user);
  }

  @Post('admin/settlements/run')
  @Roles('admin')
  run(@Body() dto: RunSettlementsDto) {
    return this.settlementsService.run(dto);
  }

  @Get('admin/settlements')
  @Roles('admin')
  listAll() {
    return this.settlementsService.listAll();
  }
}
