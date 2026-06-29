import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../common/db/database.service';
import { WalkRequest, WalkSession } from '../common/store/app.store';
import { CreateWalkRequestDto } from './dto/create-walk-request.dto';
import { FinishWalkSessionDto } from './dto/finish-walk-session.dto';

type WalkRequestRow = {
  id: string;
  owner_user_id: string;
  dog_id: string;
  scheduled_at: Date;
  request_note: string | null;
  status: WalkRequest['status'];
  walker_user_id: string | null;
  walk_session_id: string | null;
  created_at: Date;
  updated_at: Date;
};

type WalkSessionRow = {
  id: string;
  walk_request_id: string | null;
  owner_user_id: string;
  walker_user_id: string | null;
  dog_id: string;
  status: WalkSession['status'];
  started_at: Date | null;
  finished_at: Date | null;
  distance_m: number | null;
  duration_sec: number | null;
  avg_speed_kmh: number | null;
  memo: string | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class WalksRepository implements OnModuleInit {
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
      create table if not exists dogs (
        id uuid primary key,
        owner_user_id uuid not null references users(id) on delete cascade,
        name text not null,
        breed text,
        animal_registration_no text unique,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);
    await this.database.query(`
      create table if not exists walk_requests (
        id uuid primary key,
        owner_user_id uuid not null references users(id) on delete cascade,
        walker_user_id uuid references users(id) on delete set null,
        dog_id uuid not null references dogs(id) on delete restrict,
        scheduled_at timestamptz not null,
        request_note text,
        status text not null check (status in ('pending', 'accepted', 'cancelled')) default 'pending',
        walk_session_id uuid,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);
    await this.database.query(`
      create table if not exists walk_sessions (
        id uuid primary key,
        walk_request_id uuid unique references walk_requests(id) on delete set null,
        owner_user_id uuid not null references users(id) on delete cascade,
        walker_user_id uuid references users(id) on delete set null,
        dog_id uuid not null references dogs(id) on delete restrict,
        session_type text not null check (session_type in ('proxy', 'self')) default 'proxy',
        status text not null check (status in ('accepted', 'in_progress', 'finished')),
        started_at timestamptz,
        finished_at timestamptz,
        distance_m integer,
        duration_sec integer,
        avg_speed_kmh double precision,
        memo text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);
    await this.database.query(
      `alter table walk_requests add column if not exists walk_session_id uuid`,
    );
    await this.database.query(
      `create index if not exists walk_requests_owner_user_id_idx on walk_requests(owner_user_id)`,
    );
    await this.database.query(
      `create index if not exists walk_requests_walker_user_id_idx on walk_requests(walker_user_id)`,
    );
    await this.database.query(
      `create index if not exists walk_sessions_walker_user_id_idx on walk_sessions(walker_user_id)`,
    );
  }

  private toWalkRequest(row: WalkRequestRow): WalkRequest {
    return {
      id: row.id,
      ownerUserId: row.owner_user_id,
      dogId: row.dog_id,
      scheduledAt: row.scheduled_at.toISOString(),
      requestNote: row.request_note ?? undefined,
      status: row.status,
      walkerUserId: row.walker_user_id ?? undefined,
      walkSessionId: row.walk_session_id ?? undefined,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  private toWalkSession(row: WalkSessionRow): WalkSession {
    return {
      id: row.id,
      walkRequestId: row.walk_request_id ?? '',
      ownerUserId: row.owner_user_id,
      walkerUserId: row.walker_user_id ?? '',
      dogId: row.dog_id,
      status: row.status,
      startedAt: row.started_at?.toISOString(),
      finishedAt: row.finished_at?.toISOString(),
      distanceM: row.distance_m ?? undefined,
      durationSec: row.duration_sec ?? undefined,
      avgSpeedKmh: row.avg_speed_kmh ?? undefined,
      memo: row.memo ?? undefined,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async createRequest(ownerUserId: string, requestId: string, dto: CreateWalkRequestDto) {
    const result = await this.database.query<WalkRequestRow>(
      `
        insert into walk_requests (id, owner_user_id, dog_id, scheduled_at, request_note, status)
        values ($1, $2, $3, $4, $5, 'pending')
        returning id, owner_user_id, dog_id, scheduled_at, request_note, status,
          walker_user_id, walk_session_id, created_at, updated_at
      `,
      [requestId, ownerUserId, dto.dogId, dto.scheduledAt, dto.requestNote ?? null],
    );

    return this.toWalkRequest(result.rows[0]);
  }

  async findRequestsForUser(userId: string, role: string) {
    const where =
      role === 'owner'
        ? 'where owner_user_id = $1'
        : role === 'walker'
          ? "where status = 'pending' or (status = 'accepted' and walker_user_id = $1)"
          : '';
    const values = role === 'admin' ? [] : [userId];
    const result = await this.database.query<WalkRequestRow>(
      `
        select id, owner_user_id, dog_id, scheduled_at, request_note, status,
          walker_user_id, walk_session_id, created_at, updated_at
        from walk_requests
        ${where}
        order by created_at desc
      `,
      values,
    );

    return result.rows.map((row) => this.toWalkRequest(row));
  }

  async findRequestById(requestId: string) {
    const result = await this.database.query<WalkRequestRow>(
      `
        select id, owner_user_id, dog_id, scheduled_at, request_note, status,
          walker_user_id, walk_session_id, created_at, updated_at
        from walk_requests
        where id = $1
      `,
      [requestId],
    );

    return result.rows[0] ? this.toWalkRequest(result.rows[0]) : null;
  }

  async cancelRequest(requestId: string) {
    const result = await this.database.query<WalkRequestRow>(
      `
        update walk_requests
        set status = 'cancelled', updated_at = now()
        where id = $1
        returning id, owner_user_id, dog_id, scheduled_at, request_note, status,
          walker_user_id, walk_session_id, created_at, updated_at
      `,
      [requestId],
    );

    return result.rows[0] ? this.toWalkRequest(result.rows[0]) : null;
  }

  async acceptRequest(request: WalkRequest, walkerUserId: string) {
    const sessionId = randomUUID();

    return this.database.transaction(async (client) => {
      const sessionResult = await client.query<WalkSessionRow>(
        `
          insert into walk_sessions (
            id, walk_request_id, owner_user_id, walker_user_id, dog_id, session_type, status
          )
          values ($1, $2, $3, $4, $5, 'proxy', 'accepted')
          returning id, walk_request_id, owner_user_id, walker_user_id, dog_id, status,
            started_at, finished_at, distance_m, duration_sec, avg_speed_kmh, memo,
            created_at, updated_at
        `,
        [sessionId, request.id, request.ownerUserId, walkerUserId, request.dogId],
      );
      const requestResult = await client.query<WalkRequestRow>(
        `
          update walk_requests
          set status = 'accepted', walker_user_id = $2, walk_session_id = $3, updated_at = now()
          where id = $1
          returning id, owner_user_id, dog_id, scheduled_at, request_note, status,
            walker_user_id, walk_session_id, created_at, updated_at
        `,
        [request.id, walkerUserId, sessionId],
      );

      return {
        request: this.toWalkRequest(requestResult.rows[0]),
        session: this.toWalkSession(sessionResult.rows[0]),
      };
    });
  }

  async findSessionById(sessionId: string) {
    const result = await this.database.query<WalkSessionRow>(
      `
        select id, walk_request_id, owner_user_id, walker_user_id, dog_id, status,
          started_at, finished_at, distance_m, duration_sec, avg_speed_kmh, memo,
          created_at, updated_at
        from walk_sessions
        where id = $1
      `,
      [sessionId],
    );

    return result.rows[0] ? this.toWalkSession(result.rows[0]) : null;
  }

  async startSession(sessionId: string) {
    const result = await this.database.query<WalkSessionRow>(
      `
        update walk_sessions
        set status = 'in_progress', started_at = now(), updated_at = now()
        where id = $1
        returning id, walk_request_id, owner_user_id, walker_user_id, dog_id, status,
          started_at, finished_at, distance_m, duration_sec, avg_speed_kmh, memo,
          created_at, updated_at
      `,
      [sessionId],
    );

    return result.rows[0] ? this.toWalkSession(result.rows[0]) : null;
  }

  async finishSession(sessionId: string, dto: FinishWalkSessionDto, avgSpeedKmh: number) {
    const result = await this.database.query<WalkSessionRow>(
      `
        update walk_sessions
        set status = 'finished',
            distance_m = $2,
            duration_sec = $3,
            avg_speed_kmh = $4,
            memo = $5,
            finished_at = now(),
            updated_at = now()
        where id = $1
        returning id, walk_request_id, owner_user_id, walker_user_id, dog_id, status,
          started_at, finished_at, distance_m, duration_sec, avg_speed_kmh, memo,
          created_at, updated_at
      `,
      [sessionId, dto.distanceM, dto.durationSec, avgSpeedKmh, dto.memo ?? null],
    );

    return result.rows[0] ? this.toWalkSession(result.rows[0]) : null;
  }
}
