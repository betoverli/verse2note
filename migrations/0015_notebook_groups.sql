create table if not exists notebook_groups (
  id text primary key,
  name text not null,
  description text not null default '',
  visibility text not null default 'private',
  post_policy text not null default 'members',
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notebook_groups_listed_idx on notebook_groups (visibility, updated_at desc);

create table if not exists notebook_group_members (
  group_id text not null,
  user_id text not null,
  role text not null default 'member',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists notebook_group_members_user_idx on notebook_group_members (user_id, status);

create table if not exists notebook_group_notes (
  group_id text not null,
  note_id text not null,
  published_by text not null,
  created_at timestamptz not null default now(),
  primary key (group_id, note_id)
);

create index if not exists notebook_group_notes_note_idx on notebook_group_notes (note_id);
