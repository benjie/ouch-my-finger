import { jsonParse } from "@dataplan/json";
import { access, context, lambda, listen } from "grafast";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

export const PackagePlugin = makeExtendSchemaPlugin((build) => {
  const { sql } = build;
  if (!sql) {
    throw new Error("sql not found");
  }

  const packageSource = build.input.pgSources.find(
    (s) => !s.parameters && s.extensions?.pg?.schemaName === 'public' && s.extensions.pg.name === "packages"
  );
  if (!packageSource) {
    throw new Error("Couldn't find source for public.packages");
  }

  return {
    typeDefs: gql`
      type PackageSubscriptionPayload {
        package: Package!
        event: String
      }

      input PackageSubscriptionInput {
        packageId: String!
      }

      extend type Subscription {
        packageUpdate(input: PackageSubscriptionInput!): PackageSubscriptionPayload
      }
    `,

    plans: {
      Subscription: {
        packageUpdate: {
          subscribePlan(_root, $args) {
            const $packageId = $args.get(["input", "packageId"]);
            const $pgSubscriber = context().get("pgSubscriber");
            const $topic = lambda(
              [$packageId],
              ([packageId]) => `graphql:packages:${packageId}`,
              false
            );
            return listen($pgSubscriber, $topic, (e) => e);
          },
          plan($e) {
            return jsonParse($e);
          },
        },
      },
      PackageSubscriptionPayload: {
        package($obj) {
          const $id = access($obj, "packageId");
          return packageSource.get({ id: $id });
        },
      },
    },
  };
});