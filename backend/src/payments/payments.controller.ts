import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentsService } from './payments.service';
import { PreparePaymentDto } from './dto/prepare-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('prepare')
  @Roles('owner')
  prepare(@CurrentUser() user: AuthUser, @Body() dto: PreparePaymentDto) {
    return this.paymentsService.prepare(user, dto);
  }

  @Post('confirm')
  @Roles('owner')
  confirm(@CurrentUser() user: AuthUser, @Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirm(user, dto);
  }

  @Get(':paymentId')
  @Roles('owner', 'admin')
  getById(@CurrentUser() user: AuthUser, @Param('paymentId') paymentId: string) {
    return this.paymentsService.getById(user, paymentId);
  }

  @Post(':paymentId/refund')
  @Roles('admin')
  refund(@Param('paymentId') paymentId: string, @Body() dto: RefundPaymentDto) {
    return this.paymentsService.refund(paymentId, dto);
  }
}
