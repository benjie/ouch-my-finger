drop table if exists public.shop;
create table public.shop(
	id serial primary key,
	name text,
	type text not null,
	has_clinic boolean
);
insert into public.shop (name, type, has_clinic)
values('Super Axinom', 'super', true), ('Local Keells', 'local', false);

drop table if exists public.animal;
create table public.animal(
	id serial primary key,
	name text,
	type text not null,
	shop_id integer not null
);
comment on table public.animal is $$
  @interface mode:single type:type
  @type cat name:CatAnimal
  @type dog name:DogAnimal
$$;
insert into public.animal (name, type, shop_id)
values('Niki', 'dog', 1), ('Milo', 'cat', 2);

drop table if exists public.owner;
create table public.owner(
	id serial primary key,
	animal_id integer not null,
	owner_type text not null,
	owner_id integer not null
);
insert into public.owner (animal_id, owner_type, owner_id)
values(1, 'person', 5), (2, 'shop', 6);