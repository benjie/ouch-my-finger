# Ouch! My finger!

You were using PostGraphile, but ouch! Something went wrong!

Use this repository as a base to "build up" to a situation where you can
reproduce your issue. Then strip it back down to the absolute minimum &mdash;
the smallest SQL schema, the smallest list of plugins, the smallest diff
possible &mdash; before filing an issue linking to it.

## Quickstart

Use Node 22.6 or higher (`nvm use 24`) and install dependencies:

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
arguments in the `makePgSources` call in `graphile.config.ts`.

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
# For Node 24+
node server-express.ts

# For Node 22.6+
node --experimental-strip-types server-express.ts
# Or: yarn dev
```

## Configuration

The configuration is in `graphile.config.ts`, details on the configuration file
can be read about here:

https://postgraphile.org/postgraphile/next/config

## Docker

Populate `schema.sql` with your example, then run:

```bash
# Delete any existing volumes
docker compose down -v || true

# Rebuild and bring up docker
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
