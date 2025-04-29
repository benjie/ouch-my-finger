-- Animal table
drop table if exists public.animal;
create table public.animal(
	id serial primary key,
	name text,
	type text,
	can_bark boolean
);
insert into public.animal (name, type, can_bark)
values ('Bruno', 'dog', true), ('Ghost', 'wolf', false), ('Milo', 'cat', false);
comment on table public.animal is $$
  @interface mode:single type:type
  @type dog name:DogAnimal attributes:can_bark
  @type wolf name:WolfAnimal
  @type cat name:CatAnimal
$$;

-- Tree table
drop table if exists public.tree;
create table public.tree(
	id serial primary key,
	name text
);
insert into public.tree (name)
values ('Maho'), ('Kristina'), ('Jack');

-- Food table
drop table if exists public.food;
create table public.food(
	id serial primary key,
	name text,
	animal_id integer
);
insert into public.food (name, animal_id)
values ('Chicken', 1), ('Fish', 3), ('Carrot', null), ('Pig', 2);
