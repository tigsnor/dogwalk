import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppStore, CreditLedgerEntry } from '../common/store/app.store';
import { AuthUser } from '../common/types/auth-user';
import { AdminAdjustCreditDto } from './dto/admin-adjust-credit.dto';

@Injectable()
export class CreditsService {
  constructor(private readonly store: AppStore) {}

  private ensureUser(userId: string) {
    if (!this.store.users.has(userId)) {
      throw new NotFoundException('User not found');
    }
  }

  getBalance(userId: string) {
    this.ensureUser(userId);
    return this.store.creditBalances.get(userId) ?? 0;
  }

  wallet(user: AuthUser) {
    return {
      userId: user.id,
      balance: this.getBalance(user.id),
    };
  }

  ledger(user: AuthUser) {
    return this.store.creditLedger.filter((entry) => entry.userId === user.id);
  }

  addLedger(entry: Omit<CreditLedgerEntry, 'id' | 'createdAt'>) {
    const created: CreditLedgerEntry = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry,
    };
    this.store.creditLedger.push(created);

    const current = this.getBalance(entry.userId);
    const next = current + entry.amount;
    if (next < 0) {
      this.store.creditLedger.pop();
      throw new UnprocessableEntityException('Insufficient credit balance');
    }
    this.store.creditBalances.set(entry.userId, next);

    return created;
  }

  adminAdjust(dto: AdminAdjustCreditDto) {
    this.ensureUser(dto.userId);
    const ledger = this.addLedger({
      userId: dto.userId,
      type: 'adjust',
      amount: dto.amount,
      memo: dto.memo ?? 'admin adjust',
    });

    return {
      ledger,
      balance: this.getBalance(dto.userId),
    };
  }
}
