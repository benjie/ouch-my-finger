import { makeExtendSchemaPlugin, gql } from 'postgraphile/utils'
import { context, lambda, listen } from 'postgraphile/grafast'
import { jsonParse } from 'postgraphile/@dataplan/json'

export const SubscriptionsPlugin = makeExtendSchemaPlugin((build) => {
  const { matches, messages } = build.input.pgRegistry.pgResources

  // noinspection JSUnusedGlobalSymbols
  return {
    typeDefs: gql`
      type MatchSyncPayload {
        match: Match
      }
      
      extend type Subscription {
        matchSync(matchId: UUID!): MatchSyncPayload!
      }
    `,
    plans: {
      Subscription: {
        matchSync: {
          subscribePlan: (_, args) => listen(
            context()
              .get('pgSubscriber'),
            lambda(args.getRaw('matchId'), (id) => `match:${id}:sync`),
            jsonParse
          ),
          plan: ($json) => $json
        }
      },
      MatchSyncPayload: {
        match: ($json) => matches.get({ id: $json.get('match_id') }),
      }
    }
  }
})
