-- User-owned verse lists. `id` is the public handle for a future share URL /c/:id.
-- visibility: private (owner only) | unlisted | public — only private is used in v1.
create table if not exists user_collections (
  id          text primary key,
  user_id     text not null,
  title       text not null,
  slug        text not null default '',
  visibility  text not null default 'private',
  passages    text not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists user_collections_user_id_idx on user_collections (user_id);
create unique index if not exists user_collections_user_slug_idx
  on user_collections (user_id, slug)
  where slug <> '';
