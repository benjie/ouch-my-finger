# PgAggregates + Connection Filter Reproduction

## Environment
- Node.js: `v24.10.0`
- Yarn: `4.9.2` (via `packageManager`)
- Git commit checked out: `d8eaf989bf2a934a67cbce96c77256fc4dedd112`
- Key packages:
  - `postgraphile@5.0.0-beta.49`
  - `@graphile/pg-aggregates@0.2.0-beta.8`
  - `postgraphile-plugin-connection-filter@3.0.0-beta.8`
  - Resolution pins: `@dataplan/pg@0.0.1-beta.39`, `grafast@0.1.1-beta.26`

## Steps to Reproduce
1. Install dependencies:
   ```bash
   yarn install
   ```
2. Launch PostGraphile (the script prepares the database and applies `schema.sql` automatically):
   ```bash
   yarn postgraphile
   ```
   - Uses `DATABASE_URL=postgres:///pg_aggregates_connection_filter_repro` and `DATABASE_SCHEMAS=app_public` by default.
   - Override with `DATABASE_URL`, `DATABASE_SCHEMAS`, or `REPRO_DATABASE` environment variables if required.
3. In a second terminal, execute the aggregates query:
   ```bash
   curl -s -H "Content-Type: application/json" \
     --data '{"query":"{ allPosts { aggregates { sum { rowId } } } }"}' \
     http://localhost:5678/graphql
   ```

## Observed Behaviour
GraphQL response:

```json
{
  "data": {
    "allPosts": {
      "aggregates": null
    }
  },
  "errors": [
    {
      "message": "An error occurred (logged with hash: 'BV5vqYuhdPyD8KimLaueekYhFT4', id: 'CZU2NG6ZP4')",
      "locations": [
        {
          "line": 1,
          "column": 14
        }
      ],
      "path": [
        "allPosts",
        "aggregates"
      ],
      "extensions": {
        "errorId": "CZU2NG6ZP4"
      }
    }
  ]
}
```

Terminal stack trace:

```
Should not have any dependencies other than context yet

GraphQL HTTP Request:1:14
1 | { allPosts { aggregates { sum { rowId } } } }
  |              ^
Error: Should not have any dependencies other than context yet
    at PgSelectStep.clone (.../node_modules/@dataplan/pg/dist/steps/pgSelect.js:83:19)
    at PgSelectStep.clone (.../node_modules/@dataplan/pg/dist/steps/pgSelect.js:398:29)
    at PgSelectStep.connectionClone (.../node_modules/@dataplan/pg/dist/steps/pgSelect.js:401:21)
    at ConnectionStep.cloneSubplanWithoutPagination (.../node_modules/grafast/dist/steps/connection.js:237:33)
    at plan (.../node_modules/@graphile/pg-aggregates/dist/AddConnectionAggregatesPlugin.js:47:38)
    at .../node_modules/grafast/dist/engine/OperationPlan.js:1950:288
```

## Dependency Verification

```
$ yarn why @dataplan/pg
└─ postgraphile@npm:5.0.0-beta.49 [716a3]
   └─ @dataplan/pg@npm:0.0.1-beta.39 [d748d] (via npm:0.0.1-beta.39 [d748d])
```
