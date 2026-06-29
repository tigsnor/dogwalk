import { Injectable, NotFoundException } from '@nestjs/common';
import { AppStore, CreditLedgerEntry } from '../common/store/app.store';
import { AuthUser } from '../common/types/auth-user';
import { UsersRepository } from '../common/repositories/users.repository';
import { AdminAdjustCreditDto } from './dto/admin-adjust-credit.dto';
import { CreditsRepository } from './credits.repository';

@Injectable()
export class CreditsService {
  constructor(
    private readonly store: AppStore,
    private readonly usersRepository: UsersRepository,
    private readonly creditsRepository: CreditsRepository,
  ) {}

  private async ensureUser(userId: string) {
    const user = this.store.users.get(userId) ?? (await this.usersRepository.findById(userId));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.store.users.set(user.id, user);
    return user;
  }

  async getBalance(userId: string) {
    await this.ensureUser(userId);
    const balance = await this.creditsRepository.getBalance(userId);
    this.store.creditBalances.set(userId, balance);
    return balance;
  }

  async wallet(user: AuthUser) {
    return {
      userId: user.id,
      balance: await this.getBalance(user.id),
    };
  }

  async ledger(user: AuthUser) {
    const ledger = await this.creditsRepository.ledger(user.id);
    this.store.creditLedger = [
      ...this.store.creditLedger.filter((entry) => entry.userId !== user.id),
      ...ledger,
    ];
    return ledger;
  }

  async addLedger(entry: Omit<CreditLedgerEntry, 'id' | 'createdAt'>) {
    await this.ensureUser(entry.userId);
    const { ledger, balance } = await this.creditsRepository.addLedger(entry);
    this.store.creditLedger.push(ledger);
    this.store.creditBalances.set(entry.userId, balance);
    return ledger;
  }

  async adminAdjust(dto: AdminAdjustCreditDto) {
    await this.ensureUser(dto.userId);
    const ledger = await this.addLedger({
      userId: dto.userId,
      type: 'adjust',
      amount: dto.amount,
      memo: dto.memo ?? 'admin adjust',
    });

    return {
      ledger,
      balance: await this.getBalance(dto.userId),
    };
  }
}
