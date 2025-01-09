drop table if exists public.cat;
create table public.cat(
	id serial primary key,
	name text
);

drop table if exists public.dog;
create table public.dog(
	id serial primary key,
	name text,
	owner_name text
);

insert into public.cat (name)
values('Niki'), ('Milo');

insert into public.dog (name, owner_name)
values ('Bruno', 'Andrey'), ('Ghost', 'Achintha');