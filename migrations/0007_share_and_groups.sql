alter table user_collections add column if not exists source_id text not null default '';

create table if not exists plan_groups (
  id          text primary key,
  plan_id     text not null,
  host_id     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists plan_groups_host_plan_idx on plan_groups (host_id, plan_id);
create index if not exists plan_groups_plan_id_idx on plan_groups (plan_id);

create table if not exists plan_group_members (
  group_id   text not null,
  user_id    text not null,
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists plan_group_members_user_idx on plan_group_members (user_id);
