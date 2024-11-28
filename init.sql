drop table if exists public.users;

drop view if exists public.sea_view;

create table public.users (id serial primary key, name text not null);

insert into public.users (name) values ('test');

create view
  public.sea_view as
select
  50 as total_population,
  49 as developers,
  1 as non_developer_user_id;
