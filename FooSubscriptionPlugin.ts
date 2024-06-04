import { PgSelectSingleStep } from "postgraphile/@dataplan/pg";
import { jsonParse } from "postgraphile/@dataplan/json";
import { context, lambda, list, listen } from "postgraphile/grafast";
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

export const FooSubscriptionPlugin = makeExtendSchemaPlugin((build) => {
  const { foo, auth_can_access } = build.input.pgRegistry.pgResources;
  return {
    typeDefs: gql`
      extend type Subscription {
        foo(fooId: Int!): FooSubscriptionPayload
      }

      type FooSubscriptionPayload {
        event: String
        foo: Foo
      }
    `,
    plans: {
      Subscription: {
        foo: {
          subscribePlan(_$root, args) {
            const $pgSubscriber = context().get("pgSubscriber");
            const $fooId = args.get("fooId");
            const $auth = (
              auth_can_access.execute() as PgSelectSingleStep
            ).record();
            const $topic = lambda(
              list([$fooId, $auth]),
              (records: [number, { can_access: boolean }]) => {
                const [foo_id, has_access, foo] = records;
                console.log("LAMBDA RESOLVE", records);
                if (!has_access.can_access) {
                  throw new Error("Unauthorized");
                }

                return `foo:${foo_id}`;
              }
            );

            return listen($pgSubscriber, $topic, jsonParse);
          },
          plan($event) {
            return $event;
          },
        },
      },
      FooSubscriptionPayload: {
        event($event) {
          return $event.get("event");
        },
        foo($event) {
          return foo.get({ foo_id: $event.get("subject") });
        },
      },
    },
  };
});
