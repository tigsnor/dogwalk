import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../common/db/database.service';
import { Payment, WalkSession } from '../common/store/app.store';

type PaymentRow = {
  id: string;
  owner_user_id: string;
  walk_session_id: string;
  provider: Payment['provider'];
  amount_total: number;
  credit_used: number;
  amount_paid: number;
  status: Payment['status'];
  confirmed_at: Date | null;
  refunded_at: Date | null;
  refund_reason: string | null;
  settlement_id: string | null;
  created_at: Date;
  updated_at: Date;
};

type WalkSessionPaymentRow = {
  id: string;
  owner_user_id: string;
  walker_user_id: string | null;
  dog_id: string;
  status: WalkSession['status'];
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class PaymentsRepository implements OnModuleInit {
  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema() {
    await this.database.query(`
      create table if not exists payments (
        id uuid primary key,
        owner_user_id uuid not null references users(id) on delete cascade,
        walk_session_id uuid not null references walk_sessions(id) on delete restrict,
        provider text not null check (provider in ('card', 'easy-pay', 'offline-pos')),
        amount_total integer not null,
        credit_used integer not null default 0,
        amount_paid integer not null,
        status text not null check (status in ('prepared', 'confirmed', 'refunded')) default 'prepared',
        confirmed_at timestamptz,
        refunded_at timestamptz,
        refund_reason text,
        settlement_id uuid,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);
    await this.database.query(`alter table payments add column if not exists amount_total integer`);
    await this.database.query(`alter table payments add column if not exists credit_used integer not null default 0`);
    await this.database.query(`alter table payments add column if not exists confirmed_at timestamptz`);
    await this.database.query(`alter table payments add column if not exists refunded_at timestamptz`);
    await this.database.query(`alter table payments add column if not exists refund_reason text`);
    await this.database.query(`alter table payments add column if not exists settlement_id uuid`);
    await this.database.query(`update payments set amount_total = amount_paid + credit_used where amount_total is null`);
    await this.database.query(`alter table payments alter column amount_total set not null`);
    await this.database.query(`create index if not exists payments_owner_user_id_idx on payments(owner_user_id)`);
    await this.database.query(`create index if not exists payments_settlement_id_idx on payments(settlement_id)`);
  }

  private toPayment(row: PaymentRow): Payment {
    return {
      id: row.id,
      ownerUserId: row.owner_user_id,
      walkSessionId: row.walk_session_id,
      provider: row.provider,
      amountTotal: row.amount_total,
      creditUsed: row.credit_used,
      amountPaid: row.amount_paid,
      status: row.status,
      confirmedAt: row.confirmed_at?.toISOString(),
      refundedAt: row.refunded_at?.toISOString(),
      refundReason: row.refund_reason ?? undefined,
      settlementId: row.settlement_id ?? undefined,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async findSessionForOwner(ownerUserId: string, sessionId: string): Promise<WalkSession | null> {
    const result = await this.database.query<WalkSessionPaymentRow>(
      `select id, owner_user_id, walker_user_id, dog_id, status, created_at, updated_at
       from walk_sessions where id = $1 and owner_user_id = $2`,
      [sessionId, ownerUserId],
    );
    const row = result.rows[0];
    return row
      ? {
          id: row.id,
          walkRequestId: '',
          ownerUserId: row.owner_user_id,
          walkerUserId: row.walker_user_id ?? '',
          dogId: row.dog_id,
          status: row.status,
          createdAt: row.created_at.toISOString(),
          updatedAt: row.updated_at.toISOString(),
        }
      : null;
  }

  async createPrepared(input: Omit<Payment, 'createdAt' | 'updatedAt' | 'status'>) {
    const result = await this.database.query<PaymentRow>(
      `insert into payments (id, owner_user_id, walk_session_id, provider, amount_total, credit_used, amount_paid, status)
       values ($1, $2, $3, $4, $5, $6, $7, 'prepared')
       returning id, owner_user_id, walk_session_id, provider, amount_total, credit_used, amount_paid, status,
         confirmed_at, refunded_at, refund_reason, settlement_id, created_at, updated_at`,
      [
        input.id,
        input.ownerUserId,
        input.walkSessionId,
        input.provider,
        input.amountTotal,
        input.creditUsed,
        input.amountPaid,
      ],
    );
    return this.toPayment(result.rows[0]);
  }

  async findById(paymentId: string) {
    const result = await this.database.query<PaymentRow>(
      `select id, owner_user_id, walk_session_id, provider, amount_total, credit_used, amount_paid, status,
        confirmed_at, refunded_at, refund_reason, settlement_id, created_at, updated_at from payments where id = $1`,
      [paymentId],
    );
    return result.rows[0] ? this.toPayment(result.rows[0]) : null;
  }

  async confirm(paymentId: string) {
    const result = await this.database.query<PaymentRow>(
      `update payments set status = 'confirmed', confirmed_at = now(), updated_at = now()
       where id = $1
       returning id, owner_user_id, walk_session_id, provider, amount_total, credit_used, amount_paid, status,
         confirmed_at, refunded_at, refund_reason, settlement_id, created_at, updated_at`,
      [paymentId],
    );
    return result.rows[0] ? this.toPayment(result.rows[0]) : null;
  }

  async refund(paymentId: string, reason: string) {
    const result = await this.database.query<PaymentRow>(
      `update payments set status = 'refunded', refunded_at = now(), refund_reason = $2, updated_at = now()
       where id = $1
       returning id, owner_user_id, walk_session_id, provider, amount_total, credit_used, amount_paid, status,
         confirmed_at, refunded_at, refund_reason, settlement_id, created_at, updated_at`,
      [paymentId, reason],
    );
    return result.rows[0] ? this.toPayment(result.rows[0]) : null;
  }

  async unsettledConfirmedPayments() {
    const result = await this.database.query<PaymentRow>(
      `select id, owner_user_id, walk_session_id, provider, amount_total, credit_used, amount_paid, status,
        confirmed_at, refunded_at, refund_reason, settlement_id, created_at, updated_at
       from payments where status = 'confirmed' and settlement_id is null order by confirmed_at asc`,
    );
    return result.rows.map((row) => this.toPayment(row));
  }

  async markSettled(paymentIds: string[], settlementId: string) {
    if (paymentIds.length === 0) return;
    await this.database.query(
      `update payments set settlement_id = $2, updated_at = now() where id = any($1::uuid[])`,
      [paymentIds, settlementId],
    );
  }
}
