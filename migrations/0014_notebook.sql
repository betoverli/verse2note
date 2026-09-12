create table if not exists notebook_notes (
  id text primary key,
  user_id text not null,
  title text not null default '',
  happened_at date not null,
  tags text not null default '[]',
  blocks text not null default '[]',
  visibility text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notebook_notes_user_id_idx on notebook_notes (user_id, happened_at desc);

create table if not exists notebook_speakers (
  id text primary key,
  user_id text not null,
  name text not null,
  color text not null default '#c4a574',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notebook_speakers_user_id_idx on notebook_speakers (user_id);

create table if not exists note_grants (
  note_id text not null,
  user_id text not null,
  from_id text not null,
  created_at timestamptz not null default now(),
  primary key (note_id, user_id)
);
