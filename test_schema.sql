DROP SCHEMA IF EXISTS test CASCADE;

CREATE SCHEMA test;

CREATE TABLE test.foo (id text primary key, foo_name text, bar_id text);
COMMENT ON TABLE test.foo IS $$
@foreignKey ("bar_id") references test.bar ("id")|@fieldName hasBar|@foreignFieldName foosHaveThis|@foreignManySimpleFieldNameOverride foosHaveThis|@omit manyToMany
$$;


CREATE TABLE test.bar (id text primary key);
