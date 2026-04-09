-- DogWalk MVP schema (draft)

create table if not exists users (
  id uuid primary key,
  role text not null check (role in ('owner', 'walker', 'admin')),
  name text not null,
  phone text not null unique,
  email text unique,
  password_hash text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dogs (
  id uuid primary key,
  owner_user_id uuid not null references users(id),
  name text not null,
  breed text,
  animal_registration_no text unique,
  created_at timestamptz not null default now()
);

create table if not exists walk_sessions (
  id uuid primary key,
  owner_user_id uuid not null references users(id),
  walker_user_id uuid references users(id),
  dog_id uuid not null references dogs(id),
  session_type text not null check (session_type in ('proxy', 'self')),
  status text not null,
  start_at timestamptz,
  end_at timestamptz,
  distance_m integer,
  duration_sec integer,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key,
  owner_user_id uuid not null references users(id),
  walk_session_id uuid references walk_sessions(id),
  amount_paid integer not null,
  provider text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists credit_wallets (
  id uuid primary key,
  user_id uuid not null unique references users(id),
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists credit_ledger (
  id uuid primary key,
  wallet_id uuid not null references credit_wallets(id),
  type text not null check (type in ('earn', 'spend', 'expire', 'adjust')),
  amount integer not null,
  created_at timestamptz not null default now()
);
