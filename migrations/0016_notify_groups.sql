alter table user_prefs add column if not exists notify_groups boolean not null default true;
