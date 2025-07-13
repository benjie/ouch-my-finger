CREATE TABLE cat
(
    id          uuid PRIMARY KEY,
    animal_data text NOT NULL,
    cat_data    text NOT NULL
);

CREATE TABLE dog
(
    id          uuid PRIMARY KEY,
    animal_data text NOT NULL,
    dog_data    text NOT NULL
);

CREATE TYPE animal AS
(
    id          uuid,
    animal_data text
);

CREATE FUNCTION my_animals() RETURNS animal AS
$$
SELECT id, animal_data
FROM dog

UNION ALL

SELECT id, animal_data
FROM cat;
$$ LANGUAGE sql STABLE;

-- Postgraphile---------------------------------------------------------------------------------------------------------
comment on table cat is $$
  @implements Animal
$$;

comment on table dog is $$
  @implements Animal
$$;

comment on type animal is $$
  @interface mode:union
  @name Animal
  @primaryKey id
$$;

comment on column animal.animal_data is E'@notNull';

-- Data-----------------------------------------------------------------------------------------------------------------
INSERT INTO cat (id, animal_data, cat_data)
VALUES ('00000000-0000-0000-0000-000000000001', 'Animal data for cat 1', 'Cat data 1'),
       ('00000000-0000-0000-0000-000000000002', 'Animal data for cat 2', 'Cat data 2');

INSERT INTO dog (id, animal_data, dog_data)
VALUES ('00000000-0000-0000-0000-000000000003', 'Animal data for dog 1', 'Dog data 1'),
       ('00000000-0000-0000-0000-000000000004', 'Animal data for dog 2', 'Dog data 2');
