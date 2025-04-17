drop table if exists public.shop;
create table public.shop(
	id serial primary key,
	name text,
	visible boolean
);

INSERT INTO public.shop (name, visible)
SELECT
	substr(md5(random()::text), 1, 10),
	random() < 0.5
FROM generate_series(1, 50000);

drop table if exists public.pet;
create table public.pet(
	id serial primary key,
	name text,
	type text,
	shop_id integer
);

INSERT INTO public.pet (name, type, shop_id)
SELECT
    substr(md5(random()::text), 1, 10) AS name,
    (ARRAY['cat', 'dog', 'parrot', 'rabbit'])[floor(random() * 4 + 1)::int] AS type,
    floor(random() * 50000 + 1)::int AS shop_id
FROM generate_series(1, 50000);

CREATE OR REPLACE FUNCTION public.get_shop_info(id_param integer)
RETURNS json AS $$
DECLARE
    result_row json;
BEGIN
    SELECT json_build_object(
      'assetId', s.id,
	  'petId', p.id,
	  'petType', p.type,
	  'text', s.name || ' - ' || p.name
    )
    INTO result_row
    FROM public.shop s
    LEFT JOIN public.pet p
      ON s.id = p.shop_id
    WHERE s.id = id_param;

    RETURN result_row;
END;
$$ LANGUAGE plpgsql STABLE;
