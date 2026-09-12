create table if not exists push_config (
  id integer primary key default 1,
  public_key text not null,
  private_key text not null,
  last_digest date
);

create table if not exists push_subscriptions (
  endpoint text primary key,
  user_id text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  href text not null default '/app',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

alter table user_prefs add column if not exists notify_reading boolean not null default true;
alter table user_prefs add column if not exists notify_friends boolean not null default true;
alter table user_prefs add column if not exists notify_shares boolean not null default true;
