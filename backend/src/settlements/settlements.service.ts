import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppStore, Payment, Settlement } from '../common/store/app.store';
import { AuthUser } from '../common/types/auth-user';
import { PaymentsService } from '../payments/payments.service';
import { WalksRepository } from '../walks/walks.repository';
import { RunSettlementsDto } from './dto/run-settlements.dto';
import { SettlementsRepository } from './settlements.repository';

@Injectable()
export class SettlementsService {
  constructor(
    private readonly store: AppStore,
    private readonly paymentsService: PaymentsService,
    private readonly walksRepository: WalksRepository,
    private readonly settlementsRepository: SettlementsRepository,
  ) {}

  async mine(user: AuthUser) {
    const settlements = await this.settlementsRepository.findByWalker(user.id);
    for (const settlement of settlements) {
      this.store.settlements.set(settlement.id, settlement);
    }
    return settlements;
  }

  async listAll() {
    const settlements = await this.settlementsRepository.listAll();
    for (const settlement of settlements) {
      this.store.settlements.set(settlement.id, settlement);
    }
    return settlements;
  }

  async run(dto: RunSettlementsDto) {
    const payments = await this.paymentsService.unsettledConfirmedPayments();
    const grouped = new Map<string, Payment[]>();

    for (const payment of payments) {
      const session =
        this.store.walkSessions.get(payment.walkSessionId) ??
        (await this.walksRepository.findSessionById(payment.walkSessionId));
      if (!session) continue;
      this.store.walkSessions.set(session.id, session);

      const list = grouped.get(session.walkerUserId) ?? [];
      list.push(payment);
      grouped.set(session.walkerUserId, list);
    }

    const created: Settlement[] = [];

    for (const [walkerUserId, walkerPayments] of grouped.entries()) {
      const grossAmount = walkerPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
      const feeAmount = Math.floor(grossAmount * 0.2);
      const netAmount = grossAmount - feeAmount;

      const settlement = await this.settlementsRepository.create({
        id: randomUUID(),
        walkerUserId,
        paymentIds: walkerPayments.map((payment) => payment.id),
        grossAmount,
        feeAmount,
        netAmount,
      });

      this.store.settlements.set(settlement.id, settlement);
      await this.paymentsService.markSettled(settlement.paymentIds, settlement.id);
      created.push(settlement);
    }

    return {
      batchLabel: dto.batchLabel,
      settlementsCreated: created.length,
      settlements: created,
    };
  }
}
