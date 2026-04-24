import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppStore, Payment } from '../common/store/app.store';
import { AuthUser } from '../common/types/auth-user';
import { CreditsService } from '../credits/credits.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PreparePaymentDto } from './dto/prepare-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly store: AppStore,
    private readonly creditsService: CreditsService,
  ) {}

  private nowIso() {
    return new Date().toISOString();
  }

  prepare(user: AuthUser, dto: PreparePaymentDto) {
    const walkSession = this.store.walkSessions.get(dto.walkSessionId);
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

    if (creditUsed > this.creditsService.getBalance(user.id)) {
      throw new UnprocessableEntityException('Insufficient credit balance');
    }

    const timestamp = this.nowIso();
    const payment: Payment = {
      id: randomUUID(),
      ownerUserId: user.id,
      walkSessionId: dto.walkSessionId,
      provider: dto.provider,
      amountTotal: dto.amountTotal,
      creditUsed,
      amountPaid: dto.amountTotal - creditUsed,
      status: 'prepared',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.store.payments.set(payment.id, payment);
    return payment;
  }

  confirm(user: AuthUser, dto: ConfirmPaymentDto) {
    const payment = this.store.payments.get(dto.paymentId);
    if (!payment || payment.ownerUserId !== user.id) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'prepared') {
      throw new UnprocessableEntityException('Only prepared payment can be confirmed');
    }

    if (payment.creditUsed > 0) {
      this.creditsService.addLedger({
        userId: user.id,
        type: 'spend',
        amount: -payment.creditUsed,
        memo: `payment:${payment.id}`,
      });
    }

    const timestamp = this.nowIso();
    const updated: Payment = {
      ...payment,
      status: 'confirmed',
      confirmedAt: timestamp,
      updatedAt: timestamp,
    };

    this.store.payments.set(updated.id, updated);
    return updated;
  }

  getById(user: AuthUser, paymentId: string) {
    const payment = this.store.payments.get(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (user.role !== 'admin' && payment.ownerUserId !== user.id) {
      throw new ForbiddenException('No permission to view this payment');
    }

    return payment;
  }

  refund(paymentId: string, dto: RefundPaymentDto) {
    const payment = this.store.payments.get(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'confirmed') {
      throw new UnprocessableEntityException('Only confirmed payment can be refunded');
    }

    if (payment.creditUsed > 0) {
      this.creditsService.addLedger({
        userId: payment.ownerUserId,
        type: 'refund',
        amount: payment.creditUsed,
        memo: `refund:${payment.id}`,
      });
    }

    const timestamp = this.nowIso();
    const updated: Payment = {
      ...payment,
      status: 'refunded',
      refundedAt: timestamp,
      refundReason: dto.reason,
      updatedAt: timestamp,
    };

    this.store.payments.set(updated.id, updated);
    return updated;
  }

  unsettledConfirmedPayments() {
    return [...this.store.payments.values()].filter(
      (payment) => payment.status === 'confirmed' && !payment.settlementId,
    );
  }

  markSettled(paymentIds: string[], settlementId: string) {
    const timestamp = this.nowIso();

    for (const paymentId of paymentIds) {
      const payment = this.store.payments.get(paymentId);
      if (!payment) continue;

      this.store.payments.set(paymentId, {
        ...payment,
        settlementId,
        updatedAt: timestamp,
      });
    }
  }
}
