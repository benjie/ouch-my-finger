drop table if exists public.owner;
create table public.owner(
	id text,
	name text
);
insert into public.owner (id, name)
values ('1', 'Andrey'), ('2', 'Kaarel');

drop table if exists public.shop;
create table public.shop(
	id text,
	name text,
	visible boolean,
	owner_id text,
	di_pickup text,
	di_worldwide text,
	dis_special text
);
INSERT INTO public.shop (
	id,
	name,
	visible,
	owner_id,
	di_pickup,
	di_worldwide,
	dis_special
) VALUES (
	'1',
	'One',
	true,
	'1',
	'1',
	'2',
	'3'
),
(
	'2',
	'Two',
	true,
	'2',
	'1',
	'2',
	'3'
),
(
	'3',
	'Three',
	true,
	'1',
	'1',
	'2',
	'3'
),
(
	'4',
	'Four',
	true,
	'2',
	'1',
	'2',
	'3'
);

drop table if exists public.pet;
create table public.pet(
	id text,
	name text,
	type text,
	shop_id text
);
insert into public.pet (id, name, type, shop_id)
values ('1', 'Nikki', 'cat', '1'),
	('2', 'Brown', 'dog', '2');

drop view if exists public.v_metadata;

drop table if exists public.metadata;
create table public.metadata(
	id text,
	type text,
	title text
);
INSERT INTO public.metadata (id, type, title)
VALUES ('1', 'pickup', '10% off on all pickups'),
	('2', 'donate', 'We accept your valuable donations via cards'),
	('3', 'worldwide', 'We delivery anywhere with care');

drop table if exists public.metadata_enriched;
create table public.metadata_enriched(
	id text,
	type text,
	title text,
	enriched_text text
);
INSERT INTO public.metadata_enriched (id, type, title, enriched_text)
VALUES ('1', 'pickup', '10% off on all pickups', 'pickup enriched'),
	('2', 'donate', 'We accept your valuable donations via cards', 'donate enriched'),
	('3', 'worldwide', 'We delivery anywhere with care', 'worldwide enriched');

drop table if exists public.app_config CASCADE;
create table public.app_config
(
  id TEXT PRIMARY KEY,
  feed_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL default 'Fake name',
  data jsonb
);
insert into public.app_config (id, data)
values ('seo', '{ "some": "data", "other": "more data"}');

drop view if exists public.v_metadata;
CREATE VIEW public.v_metadata AS
SELECT
	m.id,
	m.type,
	m.title,
	me.enriched_text
FROM public.metadata m
       LEFT JOIN public.metadata_enriched me ON m.id = me.id
	   LEFT JOIN LATERAL (
			SELECT data as config
			FROM public.app_config
			WHERE id = 'seo'
			LIMIT 1
		) sc ON TRUE;

drop table if exists public.image;
create table public.image(
	parent_type text,
	parent_id text,
	type text,
	original text,
	dim64x64 text,
	dim128x128 text,

	primary key (parent_type, parent_id, type)
);
insert into public.image (parent_type, parent_id, type, original, dim64x64, dim128x128)
values ('shop', '1', 'front', 'http://fake-original', 'http://fake-64', null),
('shop', '2', 'front', 'http://fake-original', 'http://fake-64', 'http://fake-128');

CREATE OR REPLACE FUNCTION public.get_shop_info(id_param text)
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
