drop schema if exists app_public cascade;
create schema app_public;

create table app_public.posts (
  id serial primary key,
  row_id integer not null
);

insert into app_public.posts (row_id) values
  (1),
  (2),
  (3);
