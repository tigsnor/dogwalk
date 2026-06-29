import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { getEnv } from '../../config/env';

@Injectable()
export class DbStateService implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: getEnv().databaseUrl,
  });

  async ensureSchema() {
    await this.pool.query(`
      create table if not exists app_state (
        state_key text primary key,
        payload jsonb not null,
        updated_at timestamptz not null default now()
      )
    `);
  }

  async load(stateKey: string) {
    const result = await this.pool.query(
      `select payload from app_state where state_key = $1`,
      [stateKey],
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].payload as unknown;
  }

  async save(stateKey: string, payload: unknown) {
    await this.pool.query(
      `
      insert into app_state (state_key, payload, updated_at)
      values ($1, $2::jsonb, now())
      on conflict (state_key)
      do update set payload = excluded.payload, updated_at = now()
    `,
      [stateKey, JSON.stringify(payload)],
    );
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
