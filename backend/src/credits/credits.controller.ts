import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';
import { AdminAdjustCreditDto } from './dto/admin-adjust-credit.dto';
import { CreditsService } from './credits.service';

@Controller()
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('credits/wallet')
  @Roles('owner', 'walker', 'admin')
  wallet(@CurrentUser() user: AuthUser) {
    return this.creditsService.wallet(user);
  }

  @Get('credits/ledger')
  @Roles('owner', 'walker', 'admin')
  ledger(@CurrentUser() user: AuthUser) {
    return this.creditsService.ledger(user);
  }

  @Post('admin/credits/adjust')
  @Roles('admin')
  adminAdjust(@Body() dto: AdminAdjustCreditDto) {
    return this.creditsService.adminAdjust(dto);
  }
}
