alter table user_prefs add column if not exists avatar_id text not null default 'book';
alter table user_prefs add column if not exists handle text not null default '';
alter table user_prefs add column if not exists first_name text not null default '';
alter table user_prefs add column if not exists last_name text not null default '';
alter table user_prefs add column if not exists email text not null default '';
create unique index if not exists user_prefs_handle_idx on user_prefs (handle) where handle <> '';
