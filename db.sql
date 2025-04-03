drop schema if exists app_public cascade;
drop schema if exists app_private cascade;

drop role if exists authenticated;
create role authenticated;

create schema app_public authorization postgres;
create schema app_private authorization postgres;

grant usage on schema app_public to authenticated;

create function app_private.current_user_id()
  returns uuid
  language sql
  set search_path = ''
  security definer as
$$
select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid;
$$;
alter function app_private.current_user_id() owner to postgres;

create table app_public.users (
  id       uuid    default gen_random_uuid() not null primary key,
  name     text                              not null
);

grant all on table app_public.users to authenticated;

create function app_public.current_user()
  returns app_public.users
  language sql
  stable
  set search_path = ''
  security definer as
$$
select u.*
from app_public.users as u
where u.id = app_private.current_user_id();
$$;
alter function app_public.current_user() owner to postgres;

alter table app_public.users
  owner to postgres,
  enable row level security;

create policy "users select" on app_public.users
  for select
  to authenticated
  using (true);

insert into app_public.users (id, name)
values
  ('002782bc-a77b-44eb-8d12-b108acdb5fcb', 'Bob'),
  ('005196f7-1ecb-4f6e-b0de-32e79cafb3d2', 'Jamie'),
  ('0175b7db-e204-4cc9-bd8f-d30c74377eb9', 'Valerie');

create table app_public.matches (
  id           uuid    default gen_random_uuid() not null primary key,
  from_user_id uuid                              not null references app_public.users on delete cascade,
  to_user_id   uuid                              not null references app_public.users on delete cascade,
  is_online    boolean default false             not null
);

insert into app_public.matches (id, from_user_id, to_user_id)
values ('a99dc060-d645-4197-bf20-61ca193a5b18', '002782bc-a77b-44eb-8d12-b108acdb5fcb', '005196f7-1ecb-4f6e-b0de-32e79cafb3d2');

create index matches_from_user_idx on app_public.matches using btree (from_user_id);
create index matches_to_user_idx on app_public.matches using btree (to_user_id);
create index matches_is_online_idx on app_public.matches using btree (is_online);

alter table app_public.matches
  owner to postgres,
  enable row level security;

grant all on table app_public.matches to authenticated;

create policy "matches policy" on app_public.matches
  for all
  to authenticated
  using (app_private.current_user_id() in (from_user_id, to_user_id));

create function app_private.tg_notify_match_sync()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
  stable as $$
begin
  perform pg_notify('match:' || new.id || ':sync', json_build_object('id', new.id)::text);

  return new;
end;
$$;
alter function app_private.tg_notify_match_sync() owner to postgres;

create trigger _900_after_update
  after update of is_online
  on app_public.matches
  for each row
execute function app_private.tg_notify_match_sync();