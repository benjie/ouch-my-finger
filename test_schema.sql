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

INSERT INTO test.bar (id) VALUES ('1'), ('2'), ('3'), ('4');
INSERT INTO test.foo (id, foo_field, bar_id) VALUES
  ('foo', 'FOO', '1'),
  ('bar', 'BAR', '2'),
  ('baz', 'BAZ', '3'),
  ('qux', 'QUX', '4');

INSERT INTO test.baz (id, baz_field) VALUES
  ('A', 'a'),
  ('B', 'b'),
  ('C', 'c'),
  ('D', 'd');

INSERT INTO test.foo_owns_baz (subject, object) VALUES
  ('foo', 'A'),
  ('bar', 'B'),
  ('baz', 'C'),
  ('qux', 'D');
