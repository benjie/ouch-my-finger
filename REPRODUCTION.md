# Reproduction instructions

Install dependencies:

```
yarn
```

Run schema.sql in your database, for example:

```
psql postgres://postgres:postgres@localhost:5432/ouch -f schema.sql
```

Then run postgraphile:

```
yarn postgraphile
```

Open graphiql and run the following queries:

```graphql
query FileVersion {
  fileByRowId(rowId: 0) {
    name
  }
}
```

will return

```json
{
  "data": {
    "fileByRowId": {
      "name": "example.txt"
    }
  }
}
```

But running

```
query FileVersion {
  fileByRowId(rowId: 0) {
    name
    fileVersionCreatedAt
  }
}
```

will return:

```json
{
  "data": {
    "fileByRowId": null
  }
}
```

No error will be logged.
