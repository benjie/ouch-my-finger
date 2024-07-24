import { list, sideEffect, context, lambda } from "postgraphile/grafast";
import { withPgClient } from "postgraphile/@dataplan/pg";
import {
  gql,
  makeExtendSchemaPlugin,
  makeWrapPlansPlugin,
} from "postgraphile/utils";

export const BrokenWrap = makeWrapPlansPlugin(
  (context) => {
    if (context.scope.isRootQuery || context.scope.isRootMutation) {
      return { scope: context.scope };
    }
    return null;
  },
  ({ scope }) =>
    (plan) => {
      const $userId = context().get("userId");
      sideEffect($userId, () => {});

      return plan();
    }
);

export const BrokenPlugin = makeExtendSchemaPlugin((build) => {
  const { test } = build.input.pgRegistry.pgResources;
  if (!test) throw new Error("Resources not found");

  return {
    typeDefs: gql`
      extend type Query {
        tweaker(hoofer: [String]!): Int
      }
    `,
    plans: {
      Query: {
        tweaker(_, args) {
          const $step = withPgClient(
            test.executor,
            args.get("hoofer"),
            async (_pgClient, hoofer) => {
              console.log(hoofer);
              return hoofer.length;
            }
          );
          $step.hasSideEffects = true;

          return $step;
        },
      },
    },
  };
});
