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
query Comments {
  allComments {
    edges {
      node {
        id
        boxes {
          a {
            x
            y
          }
          b {
            x
            y
          }
        }
      }
    }
  }
}
```

will return

```json
{
  "data": {
    "allComments": {
      "edges": [
        {
          "node": null
        },
        {
          "node": null
        }
      ]
    }
  },
  "errors": [
    {
      "message": "Failed to parse box (2",
      "locations": [
        {
          "line": 6,
          "column": 9
        }
      ],
      "path": ["allComments", "edges", 0, "node", "boxes"],
      "extensions": {}
    },
    {
      "message": "Failed to parse box (6",
      "locations": [
        {
          "line": 6,
          "column": 9
        }
      ],
      "path": ["allComments", "edges", 1, "node", "boxes"],
      "extensions": {}
    }
  ]
}
```

But running

```
query Comments {
  allComments {
    edges {
      node {
        id
        box {
          a {
            x
            y
          }
          b {
            x
            y
          }
        }
      }
    }
  }
}
```

will return:

```json
{
  "data": {
    "allComments": {
      "edges": [
        {
          "node": {
            "id": 1,
            "box": {
              "a": {
                "x": 2,
                "y": 2
              },
              "b": {
                "x": 0,
                "y": 0
              }
            }
          }
        },
        {
          "node": {
            "id": 2,
            "box": {
              "a": {
                "x": 20,
                "y": 20
              },
              "b": {
                "x": 10,
                "y": 10
              }
            }
          }
        }
      ]
    }
  }
}
```

as it should.

The issue seems to come from the combination of box and array.
