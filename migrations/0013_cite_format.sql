alter table user_prefs add column if not exists cite_book text not null default 'name';
alter table user_prefs add column if not exists cite_sep text not null default 'colon';
