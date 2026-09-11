create table if not exists usage_daily (
  day        date primary key,
  visits     int not null default 0,
  pageviews  int not null default 0,
  signed_in  int not null default 0
);
