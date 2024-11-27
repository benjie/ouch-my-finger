CREATE DATABASE example;
CREATE SCHEMA example;
CREATE TABLE example.test (
    id SERIAL PRIMARY KEY,
    foo text[] NOT NULL,
    bar date[] NOT NULL,
    baz text[],
    bing date[]
);
ALTER TABLE example.test ENABLE ROW LEVEL SECURITY;

INSERT INTO example.test(id, foo, bar, baz, bing) VALUES (1, '{}', '{}', '{}', '{}');
INSERT INTO example.test(id, foo, bar, baz, bing) VALUES (2, '{"foo"}', '{2024-11-11}', '{"baz"}', '{2024-11-11}');

-- In the graphile UI
-- Fetch row 1 without bar resolves as expected
--
-- query MyQuery {
--   test(rowId: 1) {
--     id
--     foo
--     rowId
--   }
-- }
--
-- With bar failes to resolved with error 'Masked GraphQL error (hash: '8-OScfAOPZ-V_3XKL6FgJJXI8ZY', id: 'A7XBZW9BQU') GraphQLError: Cannot return null for non-nullable field Test.bar.'
--
-- query MyQuery {
--   test(rowId: 1) {
--     id
--     foo
--     bar
--     rowId
--   }
-- }
--
-- Record 2 provided as an example of where it works as intended
-- NOTE: Swapping foo,bar for baz,bing on the above table which do not have the NOT NULL constraints has the empty date[] array being resolved as null inconsistent with the text[] array.
