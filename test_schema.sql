DROP SCHEMA IF EXISTS test CASCADE;

CREATE SCHEMA test;

CREATE TABLE test.bar (id text primary key, bar_field text);

CREATE TABLE test.foo (id text primary key, foo_field text, bar_id text);
COMMENT ON TABLE test.foo IS $$
@foreignKey ("bar_id") references test.bar ("id")|@fieldName hasBar|@foreignFieldName foosHaveThis|@foreignManySimpleFieldNameOverride foosHaveThis|@omit manyToMany
$$;

CREATE TABLE test.baz (id text primary key, baz_field text);

CREATE TABLE test.foo_owns_baz (subject text, object text);
COMMENT ON TABLE test.foo_owns_baz IS $$
@foreignKey ("subject") references test.foo ("id")|@manyToManySimpleFieldName fooOwnsThis|@foreignSimpleFieldName ownsBazsJoin
@foreignKey ("object") references test.baz ("id")|@manyToManySimpleFieldName ownsBazs|@foreignSimpleFieldName fooOwnsThis
@omit all
@omit many
$$;

INSERT INTO test.bar (id)
  SELECT 'bar' || i::text FROM generate_series(1, 100) i;

INSERT INTO test.foo (id, foo_field, bar_id)
  SELECT
    'foo' || i::text,
    'FOO' || i::text,
    10001 - i
  FROM generate_series(1, 10000) i;

INSERT INTO test.baz (id, baz_field)
  SELECT
    'bar' || i::text,
    'BAR' || i::text
  FROM generate_series(1, 100) i;

INSERT INTO test.foo_owns_baz (subject, object)
  SELECT
    foo.id,
    baz.id
  FROM test.foo, test.baz
  WHERE RANDOM() > 0.9 OR baz.id IN ('baz1', 'baz10');
