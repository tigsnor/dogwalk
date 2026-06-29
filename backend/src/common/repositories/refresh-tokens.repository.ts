import { Injectable, OnModuleInit } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DatabaseService } from '../db/database.service';

export type RefreshTokenRecord = {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

type RefreshTokenRow = {
  id: string;
  user_id: string;
  expires_at: Date;
  revoked_at: Date | null;
};

@Injectable()
export class RefreshTokensRepository implements OnModuleInit {
  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema() {
    await this.database.query(`
      create table if not exists users (
        id uuid primary key,
        role text not null check (role in ('owner', 'walker', 'admin')),
        name text not null,
        phone text not null unique,
        email text unique,
        password_hash text,
        status text not null default 'active',
        walker_approval_status text check (walker_approval_status in ('pending', 'approved', 'rejected')),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);
    await this.database.query(`
      create table if not exists refresh_tokens (
        id uuid primary key,
        user_id uuid not null references users(id) on delete cascade,
        token_hash text not null unique,
        expires_at timestamptz not null,
        revoked_at timestamptz,
        created_at timestamptz not null default now()
      )
    `);
    await this.database.query(
      `create index if not exists refresh_tokens_user_id_idx on refresh_tokens(user_id)`,
    );
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private toRecord(row: RefreshTokenRow): RefreshTokenRecord {
    return {
      id: row.id,
      userId: row.user_id,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
    };
  }

  async create(input: { id: string; userId: string; token: string; expiresAt: Date }) {
    const result = await this.database.query<RefreshTokenRow>(
      `
        insert into refresh_tokens (id, user_id, token_hash, expires_at)
        values ($1, $2, $3, $4)
        returning id, user_id, expires_at, revoked_at
      `,
      [input.id, input.userId, this.hashToken(input.token), input.expiresAt],
    );

    return this.toRecord(result.rows[0]);
  }

  async findActiveByToken(token: string): Promise<RefreshTokenRecord | null> {
    const result = await this.database.query<RefreshTokenRow>(
      `
        select id, user_id, expires_at, revoked_at
        from refresh_tokens
        where token_hash = $1 and revoked_at is null and expires_at > now()
      `,
      [this.hashToken(token)],
    );

    return result.rows[0] ? this.toRecord(result.rows[0]) : null;
  }

  async revoke(tokenId: string) {
    await this.database.query(
      `update refresh_tokens set revoked_at = now() where id = $1 and revoked_at is null`,
      [tokenId],
    );
  }
}
