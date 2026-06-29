import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppStore, Settlement } from '../common/store/app.store';
import { AuthUser } from '../common/types/auth-user';
import { PaymentsService } from '../payments/payments.service';
import { RunSettlementsDto } from './dto/run-settlements.dto';

@Injectable()
export class SettlementsService {
  constructor(
    private readonly store: AppStore,
    private readonly paymentsService: PaymentsService,
  ) {}

  mine(user: AuthUser) {
    return [...this.store.settlements.values()].filter(
      (settlement) => settlement.walkerUserId === user.id,
    );
  }

  listAll() {
    return [...this.store.settlements.values()];
  }

  run(dto: RunSettlementsDto) {
    const payments = this.paymentsService.unsettledConfirmedPayments();
    const grouped = new Map<string, typeof payments>();

    for (const payment of payments) {
      const session = this.store.walkSessions.get(payment.walkSessionId);
      if (!session) continue;

      const list = grouped.get(session.walkerUserId) ?? [];
      list.push(payment);
      grouped.set(session.walkerUserId, list);
    }

    const created: Settlement[] = [];

    for (const [walkerUserId, walkerPayments] of grouped.entries()) {
      const grossAmount = walkerPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
      const feeAmount = Math.floor(grossAmount * 0.2);
      const netAmount = grossAmount - feeAmount;
      const settlementId = randomUUID();

      const settlement: Settlement = {
        id: settlementId,
        walkerUserId,
        paymentIds: walkerPayments.map((payment) => payment.id),
        grossAmount,
        feeAmount,
        netAmount,
        createdAt: new Date().toISOString(),
      };

      this.store.settlements.set(settlementId, settlement);
      this.paymentsService.markSettled(settlement.paymentIds, settlementId);
      created.push(settlement);
    }

    return {
      batchLabel: dto.batchLabel,
      settlementsCreated: created.length,
      settlements: created,
    };
  }
}
