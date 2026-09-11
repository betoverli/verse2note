create table if not exists plan_marks (
  user_id    text not null,
  plan_id    text not null,
  day        int not null,
  marked_on  date not null default current_date,
  primary key (user_id, plan_id, day)
);

create index if not exists plan_marks_user_day_idx on plan_marks (user_id, marked_on);
