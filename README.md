# Ouch! My finger!

**BLEEDING EDGE SOFTWARE** - be sure to read the production caveats at
https://grafast.org/caveats/ and wear appropriate personal protective equipment
to protect your fingers from the sharp edges!

## Quickstart

Install dependencies:

```
yarn
```

Run PostGraphile CLI and pass the connection string and schemas:

```
yarn postgraphile -c postgres:///my_db -s app_public
```

(Replace `postgres:///my_db` with your connection string, and `app_public` with
your database schema name.)

## Usage

In addition to the quick command line above, you can set your database
connection string and schemas as environmental variables or edit the relevant
arguments in the `makePgSources` call in `graphile.config.mjs`.

```bash
# Different syntax may be required depending on your shell
export DATABASE_URL=postgres:///my_db
export DATABASE_SCHEMAS=app_public
```

Then run PostGraphile CLI with no arguments:

```bash
yarn postgraphile
```

Or run the library mode using an Express server:

```bash
node server-express.mjs
```

## Configuration

The configuration is in `graphile.config.mjs`, details on the configuration file
can be read about here:

https://postgraphile.org/postgraphile/next/config

## Docker

Populate `schema.sql` with your example, then run:

```bash
docker compose up --build
```

This will install the latest versions of the modules and spin up PostGraphile
against a new PostgreSQL instance prepopulated with `schema.sql`.

If you need to communicate with Postgres directly, use port 6432:

```bash
psql postgres://postgres:postgres@localhost:6432/postgres
```

If you want to update to using the latest module versions (i.e. force a rebuild
of the Docker image), use:

```bash
docker compose up --build --force-recreate
```
