import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../common/db/database.service';
import { Settlement } from '../common/store/app.store';

type SettlementRow = {
  id: string;
  walker_user_id: string;
  payment_ids: string[];
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  created_at: Date;
};

@Injectable()
export class SettlementsRepository implements OnModuleInit {
  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema() {
    await this.database.query(`
      create table if not exists settlements (
        id uuid primary key,
        walker_user_id uuid not null references users(id) on delete cascade,
        payment_ids uuid[] not null default '{}',
        gross_amount integer not null,
        fee_amount integer not null,
        net_amount integer not null,
        created_at timestamptz not null default now()
      )
    `);
    await this.database.query(
      `create index if not exists settlements_walker_user_id_idx on settlements(walker_user_id)`,
    );
  }

  private toSettlement(row: SettlementRow): Settlement {
    return {
      id: row.id,
      walkerUserId: row.walker_user_id,
      paymentIds: row.payment_ids,
      grossAmount: row.gross_amount,
      feeAmount: row.fee_amount,
      netAmount: row.net_amount,
      createdAt: row.created_at.toISOString(),
    };
  }

  async create(settlement: Omit<Settlement, 'createdAt'>) {
    const result = await this.database.query<SettlementRow>(
      `insert into settlements (id, walker_user_id, payment_ids, gross_amount, fee_amount, net_amount)
       values ($1, $2, $3::uuid[], $4, $5, $6)
       returning id, walker_user_id, payment_ids, gross_amount, fee_amount, net_amount, created_at`,
      [
        settlement.id,
        settlement.walkerUserId,
        settlement.paymentIds,
        settlement.grossAmount,
        settlement.feeAmount,
        settlement.netAmount,
      ],
    );
    return this.toSettlement(result.rows[0]);
  }

  async findByWalker(walkerUserId: string) {
    const result = await this.database.query<SettlementRow>(
      `select id, walker_user_id, payment_ids, gross_amount, fee_amount, net_amount, created_at
       from settlements where walker_user_id = $1 order by created_at desc`,
      [walkerUserId],
    );
    return result.rows.map((row) => this.toSettlement(row));
  }

  async listAll() {
    const result = await this.database.query<SettlementRow>(
      `select id, walker_user_id, payment_ids, gross_amount, fee_amount, net_amount, created_at
       from settlements order by created_at desc`,
    );
    return result.rows.map((row) => this.toSettlement(row));
  }
}
