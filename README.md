# Ouch! My finger!

**BLEEDING EDGE SOFTWARE** - be sure to read the production caveats at
https://grafast.org/caveats/ and wear appropriate personal protective equipment
to protect your fingers from the sharp edges!

Note to use this repo you will need to know the secret from
https://grafast.org/caveats/ - which means you'll need to be a sponsor. If
you're already a sponsor, ping Jem
([on the Graphile Discord](https://discord.gg/graphile),
[via Twitter](https://twitter.com/jemgillam), or via email on their first name
at graphile.com) and they'll help you get set up.

## Usage

Install dependencies:

```
yarn
```

Run PostGraphile:

```
yarn postgraphile -c postgres:///my_db -s app_public
```

(Replace `postgres:///my_db` with your connection string, and `app_public` with
your database schema name.)

Note the configuration is in `graphile.config.mjs`, details on the configuration
file can be read about here:

https://postgraphile.org/postgraphile/next/config
