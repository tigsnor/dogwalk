import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppStore } from '../common/store/app.store';
import { AuthUser } from '../common/types/auth-user';
import { CreditsService } from '../credits/credits.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PreparePaymentDto } from './dto/prepare-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly store: AppStore,
    private readonly creditsService: CreditsService,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  async prepare(user: AuthUser, dto: PreparePaymentDto) {
    const walkSession = await this.paymentsRepository.findSessionForOwner(user.id, dto.walkSessionId);
    if (!walkSession || walkSession.ownerUserId !== user.id) {
      throw new NotFoundException('Walk session not found');
    }

    if (walkSession.status !== 'finished') {
      throw new UnprocessableEntityException('Payment can be prepared only after walk finished');
    }

    const creditUsed = dto.creditUsed ?? 0;
    if (creditUsed > dto.amountTotal) {
      throw new UnprocessableEntityException('creditUsed cannot exceed amountTotal');
    }

    if (creditUsed > (await this.creditsService.getBalance(user.id))) {
      throw new UnprocessableEntityException('Insufficient credit balance');
    }

    const payment = await this.paymentsRepository.createPrepared({
      id: randomUUID(),
      ownerUserId: user.id,
      walkSessionId: dto.walkSessionId,
      provider: dto.provider,
      amountTotal: dto.amountTotal,
      creditUsed,
      amountPaid: dto.amountTotal - creditUsed,
    });

    this.store.payments.set(payment.id, payment);
    return payment;
  }

  async confirm(user: AuthUser, dto: ConfirmPaymentDto) {
    const payment = await this.paymentsRepository.findById(dto.paymentId);
    if (!payment || payment.ownerUserId !== user.id) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'prepared') {
      throw new UnprocessableEntityException('Only prepared payment can be confirmed');
    }

    if (payment.creditUsed > 0) {
      await this.creditsService.addLedger({
        userId: user.id,
        type: 'spend',
        amount: -payment.creditUsed,
        memo: `payment:${payment.id}`,
      });
    }

    const updated = await this.paymentsRepository.confirm(payment.id);
    if (!updated) {
      throw new NotFoundException('Payment not found');
    }

    this.store.payments.set(updated.id, updated);
    return updated;
  }

  async getById(user: AuthUser, paymentId: string) {
    const payment = await this.paymentsRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (user.role !== 'admin' && payment.ownerUserId !== user.id) {
      throw new ForbiddenException('No permission to view this payment');
    }

    return payment;
  }

  async refund(paymentId: string, dto: RefundPaymentDto) {
    const payment = await this.paymentsRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'confirmed') {
      throw new UnprocessableEntityException('Only confirmed payment can be refunded');
    }

    if (payment.creditUsed > 0) {
      await this.creditsService.addLedger({
        userId: payment.ownerUserId,
        type: 'refund',
        amount: payment.creditUsed,
        memo: `refund:${payment.id}`,
      });
    }

    const updated = await this.paymentsRepository.refund(payment.id, dto.reason ?? 'admin refund');
    if (!updated) {
      throw new NotFoundException('Payment not found');
    }

    this.store.payments.set(updated.id, updated);
    return updated;
  }

  async unsettledConfirmedPayments() {
    const payments = await this.paymentsRepository.unsettledConfirmedPayments();
    for (const payment of payments) {
      this.store.payments.set(payment.id, payment);
    }
    return payments;
  }

  async markSettled(paymentIds: string[], settlementId: string) {
    await this.paymentsRepository.markSettled(paymentIds, settlementId);
    for (const paymentId of paymentIds) {
      const payment = this.store.payments.get(paymentId);
      if (!payment) continue;
      this.store.payments.set(paymentId, {
        ...payment,
        settlementId,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}
