create table if not exists user_prefs (
  user_id text primary key,
  locale text not null,
  app_id text not null,
  translation_id text not null,
  prefer_native boolean not null default false,
  copy_format text not null default 'rich',
  books_compact boolean not null default false,
  theme text not null default 'system',
  active_plans text not null default '[]',
  plan_progress text not null default '{}',
  updated_at timestamptz not null default now()
);
