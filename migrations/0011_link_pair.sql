delete from user_links a
where exists (
  select 1 from user_links b
  where b.requester_id = a.addressee_id
    and b.addressee_id = a.requester_id
    and a.id > b.id
);

create unique index if not exists user_links_pair_uniq
  on user_links (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
