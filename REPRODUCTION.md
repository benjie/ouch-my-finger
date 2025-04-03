Schema defined in `db.sql`. Note that all id are hardcoded in the db.sql, so any uuid referenced below is accurate.

The command I ran to start the server was:
```bash
GRAPHILE_ENV=development yarn postgraphile -c postgres://postgres:postgres@localhost/postgres -s app_public
```
Ruru headers (to be signed in as "Bob" user): 
```json
{
  "Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDI3ODJiYy1hNzdiLTQ0ZWItOGQxMi1iMTA4YWNkYjVmY2IiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImlhdCI6MTUxNjIzOTAyMn0.nCrVpYq-wirAXNhk2puFShVvToQ_1ZODAXztJoMQnCU"
}
```

query to verify you are Bob user:
```graphql
query CurrentUserQuery {
  currentUser {
    name
  }
}
```

query to verify that you are able to query a match record you are part of, and the related users:
```graphql
query MatchQuery {
  matchById(id:"a99dc060-d645-4197-bf20-61ca193a5b18") {
    userByToUserId {
      name
    }
    userByFromUserId {
      name
    }
    isOnline
  }
}
```

subscription to be notified if the 'is_online' field of a match changes:
```graphql
subscription MatchSyncSubscription {
  matchSync(matchId:"a99dc060-d645-4197-bf20-61ca193a5b18") {
    match {
      isOnline
    }
  }
}
```