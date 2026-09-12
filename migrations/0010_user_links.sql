create table if not exists user_links (
  id text primary key,
  requester_id text not null,
  addressee_id text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id)
);
create index if not exists user_links_addressee_idx on user_links (addressee_id, status);
create index if not exists user_links_requester_idx on user_links (requester_id, status);

create table if not exists collection_grants (
  collection_id text not null,
  user_id text not null,
  from_id text not null,
  created_at timestamptz not null default now(),
  primary key (collection_id, user_id)
);
create index if not exists collection_grants_user_idx on collection_grants (user_id);
