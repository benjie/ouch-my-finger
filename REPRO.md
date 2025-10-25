# PgAggregates + ConnectionFilter Repro Plan

## Goal
Demonstrate the `PgSelectStep.clone` "Should not have any dependencies other than context yet" error when `@graphile/pg-aggregates` and `postgraphile-plugin-connection-filter` are both enabled in PostGraphile v5, using the [`benjie/ouch-my-finger`](https://github.com/benjie/ouch-my-finger) starter as the base.

## Prerequisites
- Node.js ≥ 24 (use `nvm use 24` as suggested in the repo).
- Local PostgreSQL instance you can create/drop databases on (or use the repo’s Docker workflow).
- `yarn set version stable` already committed in upstream; no extra global tooling needed.

## High-Level Outline
1. Clone the template repo, create a fresh branch, and ensure clean git status.
2. Trim dependencies to just the modules needed for the repro and pin their versions to match the failing project (`postgraphile@5.0.0-beta.49`, `@dataplan/pg@0.0.1-beta.39`, `@graphile/pg-aggregates@0.2.0-beta.8`, `postgraphile-plugin-connection-filter@3.0.0-beta.8`).
3. Add a minimal schema (single table + seed rows) that exposes a connection field with a numeric column we can sum.
4. Configure `graphile.config.ts` to only load the Amber preset, V4 preset, `PostGraphileConnectionFilterPreset`, and `PgAggregatesPreset`.
5. Run PostGraphile, execute the connection aggregates query, and capture the thrown error and stack trace.
6. Document the exact steps, CLI output, and GraphQL query in the repo (README update or dedicated `NOTES.md`) before filing upstream.

## Detailed Steps

### 1. Repo setup
```bash
git clone https://github.com/benjie/ouch-my-finger.git pg-aggregates-connection-filter-repro
cd pg-aggregates-connection-filter-repro
git switch -c repro/pg-aggregates-connection-filter
```
Confirm `git status` is clean before making changes.

### 2. Align dependency versions
Edit `package.json` so the `dependencies` section contains only:

```json
"dependencies": {
  "@graphile/pg-aggregates": "0.2.0-beta.8",
  "postgraphile": "5.0.0-beta.49",
  "postgraphile-plugin-connection-filter": "3.0.0-beta.8"
},
"resolutions": {
  "@dataplan/pg": "0.0.1-beta.39",
  "grafast": "0.1.1-beta.26"
}
```

Notes:
- Bringing `postgraphile` in directly pulls the rest of the Graphile stack; the explicit `resolutions` lock the same beta cuts used in the failing project.
- Remove unused extras (`express`, `pg-many-to-many`, persisted queries, etc.) to keep the diff minimal.

Run `yarn install` afterward to update the lockfile.

### 3. Minimal schema
Replace `schema.sql` with a minimal schema:

```sql
drop schema if exists app_public cascade;
create schema app_public;

create table app_public.posts (
  id serial primary key,
  row_id integer not null
);

insert into app_public.posts (row_id) values
  (1),
  (2),
  (3);
```

If you prefer using migrations, you can keep the SQL in `schema.sql`; the Docker workflow will load it automatically.

### 4. Configuration tweaks
Update `graphile.config.ts`:
- Keep `AmberPreset` and `makeV4Preset` (with GraphiQL enabled).
- Remove optional plugins (`PgManyToManyPreset`, `PgOmitArchivedPlugin`, persisted queries, tags plugin, etc.) so only the following remain in `extends`:

```ts
extends: [
  AmberPreset.default ?? AmberPreset,
  makeV4Preset({ graphiql: true, graphiqlRoute: "/" }),
  PostGraphileConnectionFilterPreset,
  PgAggregatesPreset,
],
```

- Drop `plugins: [...]` entirely unless needed for the repro.
- Leave the `pgServices` config untouched except for ensuring `schemas: ["app_public"]` for clarity.

### 5. Run the server
Either start PostGraphile directly:

```bash
createdb pg_aggregates_connection_filter_repro
psql pg_aggregates_connection_filter_repro < schema.sql
DATABASE_URL=postgres:///pg_aggregates_connection_filter_repro \
DATABASE_SCHEMAS=app_public \
yarn postgraphile
```

Or use Docker Compose per the repo instructions (`docker compose up --build` after placing the SQL).

### 6. Trigger the failure
Open GraphiQL (http://localhost:5678/ by default with the config above) and run:

```graphql
{
  allPosts {
    aggregates {
      sum {
        rowId
      }
    }
  }
}
```

Expected result: the server returns a masked error in GraphQL. In the terminal logs you should see:

```
Error: Should not have any dependencies other than context yet
    at PgSelectStep.clone ...
    at PgSelectStep.connectionClone ...
    at ConnectionStep.cloneSubplanWithoutPagination ...
    at PgAggregatesAddConnectionAggregatesPlugin plan ...
```

If you comment out either `PostGraphileConnectionFilterPreset` or `PgAggregatesPreset` in `graphile.config.ts`, the query should start working again, confirming that the interaction between the two presets triggers the bug.

### 7. Capture evidence
- Save the terminal output (complete stack trace).
- Grab a screenshot of the GraphiQL response (error + masked message).
- Record the exact commit hash and `yarn why @dataplan/pg` output to prove the dependency version.

Consider adding a short `NOTES.md` that states:
- Node version
- Exact SQL schema
- GraphQL query
- Error stack trace

With that committed alongside `schema.sql`, `graphile.config.ts`, and the trimmed `package.json`, you’ll have a minimal fork you can link in the upstream issue.

## Optional Follow-up
- Apply the one-line patch from our project (log instead of throw) to confirm it resolves the repro.
- Test against the latest nightly packages to see whether the bug has already been addressed.
- If upstream requests, add a failing Jest/Vitest test that calls the Grafast plan directly, though the manual repro above should be sufficient.

