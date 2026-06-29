import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { AuthUser, UserRole } from '../types/auth-user';

export type CreateUserInput = {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  passwordHash: string;
  walkerApprovalStatus?: 'pending' | 'approved' | 'rejected';
};

type UserRow = {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  password_hash: string;
};

@Injectable()
export class UsersRepository implements OnModuleInit {
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
    await this.database.query(
      `alter table users add column if not exists walker_approval_status text check (walker_approval_status in ('pending', 'approved', 'rejected'))`,
    );
  }

  private toAuthUser(row: UserRow): AuthUser {
    return {
      id: row.id,
      role: row.role,
      name: row.name,
      phone: row.phone,
      passwordHash: row.password_hash,
    };
  }

  async create(input: CreateUserInput): Promise<AuthUser> {
    const result = await this.database.query<UserRow>(
      `
        insert into users (id, role, name, phone, password_hash, walker_approval_status)
        values ($1, $2, $3, $4, $5, $6)
        returning id, role, name, phone, password_hash
      `,
      [
        input.id,
        input.role,
        input.name,
        input.phone,
        input.passwordHash,
        input.walkerApprovalStatus ?? null,
      ],
    );

    return this.toAuthUser(result.rows[0]);
  }

  async findById(userId: string): Promise<AuthUser | null> {
    const result = await this.database.query<UserRow>(
      `select id, role, name, phone, password_hash from users where id = $1`,
      [userId],
    );

    return result.rows[0] ? this.toAuthUser(result.rows[0]) : null;
  }

  async findByPhone(phone: string): Promise<AuthUser | null> {
    const result = await this.database.query<UserRow>(
      `select id, role, name, phone, password_hash from users where phone = $1`,
      [phone],
    );

    return result.rows[0] ? this.toAuthUser(result.rows[0]) : null;
  }
}
