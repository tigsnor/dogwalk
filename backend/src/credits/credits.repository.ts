import { Injectable, OnModuleInit, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseClient, DatabaseService } from '../common/db/database.service';
import { CreditLedgerEntry, CreditLedgerType } from '../common/store/app.store';

type CreditLedgerRow = {
  id: string;
  user_id: string;
  type: CreditLedgerType;
  amount: number;
  memo: string | null;
  created_at: Date;
};

type WalletRow = { balance: number };

@Injectable()
export class CreditsRepository implements OnModuleInit {
  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema() {
    await this.database.query(`
      create table if not exists credit_wallets (
        id uuid primary key,
        user_id uuid not null unique references users(id) on delete cascade,
        balance integer not null default 0,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);
    await this.database.query(`
      create table if not exists credit_ledger (
        id uuid primary key,
        wallet_id uuid not null references credit_wallets(id) on delete cascade,
        user_id uuid not null references users(id) on delete cascade,
        type text not null check (type in ('earn', 'spend', 'expire', 'adjust', 'refund')),
        amount integer not null,
        memo text,
        created_at timestamptz not null default now()
      )
    `);
    await this.database.query(
      `create index if not exists credit_ledger_user_id_idx on credit_ledger(user_id)`,
    );
  }

  private toLedger(row: CreditLedgerRow): CreditLedgerEntry {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: row.amount,
      memo: row.memo ?? undefined,
      createdAt: row.created_at.toISOString(),
    };
  }

  private async ensureWallet(userId: string, client: DatabaseClient) {
    await client.query(
      `insert into credit_wallets (id, user_id, balance) values ($1, $2, 0) on conflict (user_id) do nothing`,
      [randomUUID(), userId],
    );
    const result = await client.query<{ id: string; balance: number }>(
      `select id, balance from credit_wallets where user_id = $1 for update`,
      [userId],
    );
    return result.rows[0];
  }

  async getBalance(userId: string) {
    const result = await this.database.query<WalletRow>(
      `select balance from credit_wallets where user_id = $1`,
      [userId],
    );
    return result.rows[0]?.balance ?? 0;
  }

  async ledger(userId: string) {
    const result = await this.database.query<CreditLedgerRow>(
      `select id, user_id, type, amount, memo, created_at from credit_ledger where user_id = $1 order by created_at desc`,
      [userId],
    );
    return result.rows.map((row) => this.toLedger(row));
  }

  async addLedger(input: Omit<CreditLedgerEntry, 'id' | 'createdAt'>) {
    return this.database.transaction(async (client) => {
      const wallet = await this.ensureWallet(input.userId, client);
      const nextBalance = wallet.balance + input.amount;
      if (nextBalance < 0) {
        throw new UnprocessableEntityException('Insufficient credit balance');
      }

      const ledgerResult = await client.query<CreditLedgerRow>(
        `insert into credit_ledger (id, wallet_id, user_id, type, amount, memo)
         values ($1, $2, $3, $4, $5, $6)
         returning id, user_id, type, amount, memo, created_at`,
        [randomUUID(), wallet.id, input.userId, input.type, input.amount, input.memo ?? null],
      );
      await client.query(`update credit_wallets set balance = $2, updated_at = now() where id = $1`, [
        wallet.id,
        nextBalance,
      ]);

      return { ledger: this.toLedger(ledgerResult.rows[0]), balance: nextBalance };
    });
  }
}
