CREATE TABLE users (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    age integer,
    name text
);

CREATE UNIQUE INDEX users_pkey ON users (id int4_ops);

CREATE TABLE books (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author integer REFERENCES users (id),
    edition integer,
    CONSTRAINT unique_stuff UNIQUE (author, edition)
);

CREATE UNIQUE INDEX books_pkey ON books (id int4_ops);

CREATE UNIQUE INDEX unique_stuff ON books (
    author int4_ops,
    edition int4_ops
);