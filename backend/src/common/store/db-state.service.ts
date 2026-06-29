import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';

@Injectable()
export class DbStateService {
  constructor(private readonly database: DatabaseService) {}

  async ensureSchema() {
    await this.database.query(`
      create table if not exists app_state (
        state_key text primary key,
        payload jsonb not null,
        updated_at timestamptz not null default now()
      )
    `);
  }

  async load(stateKey: string) {
    const result = await this.database.query<{ payload: unknown }>(
      `select payload from app_state where state_key = $1`,
      [stateKey],
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].payload;
  }

  async save(stateKey: string, payload: unknown) {
    await this.database.query(
      `
      insert into app_state (state_key, payload, updated_at)
      values ($1, $2::jsonb, now())
      on conflict (state_key)
      do update set payload = excluded.payload, updated_at = now()
    `,
      [stateKey, JSON.stringify(payload)],
    );
  }
}
