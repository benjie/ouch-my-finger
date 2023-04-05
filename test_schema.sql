DROP SCHEMA IF EXISTS test CASCADE;

CREATE SCHEMA test;

CREATE TABLE test.bar (id text primary key);

CREATE TABLE test.foo (id text primary key, foo_name text, bar_id text);
COMMENT ON TABLE test.foo IS $$
@foreignKey ("bar_id") references test.bar ("id")|@fieldName hasBar|@foreignFieldName foosHaveThis|@foreignManySimpleFieldNameOverride foosHaveThis|@omit manyToMany
$$;


INSERT INTO test.bar (id) VALUES ('1'), ('2'), ('3'), ('4');
INSERT INTO test.foo (id, foo_name, bar_id) VALUES
  ('foo', 'FOO', '1'),
  ('bar', 'BAR', '2'),
  ('baz', 'BAZ', '3'),
  ('qux', 'QUX', '4');
