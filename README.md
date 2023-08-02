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

```
# Different syntax may be required depending on your shell
export DATABASE_URL=postgres:///my_db
export DATABASE_SCHEMAS=app_public
```

Then run PostGraphile CLI with no arguments:

```
yarn postgraphile
```

Or run the library mode using an Express server:

```
node server-express.mjs
```

## Configuration

The configuration is in `graphile.config.mjs`, details on the configuration file
can be read about here:

https://postgraphile.org/postgraphile/next/config
