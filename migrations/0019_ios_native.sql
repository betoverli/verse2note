create table if not exists apns_devices (
  token text primary key,
  user_id text not null,
  sandbox boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists apns_devices_user_idx on apns_devices (user_id);

create table if not exists native_auth_handoff (
  code_hash text primary key,
  user_id text not null,
  session_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists native_auth_handoff_expires_idx on native_auth_handoff (expires_at);
