import { withPgClient } from "@dataplan/pg";
import { list } from "postgraphile/grafast";
import { makeWrapPlansPlugin } from "postgraphile/utils";

export const BrokenPlugin = makeWrapPlansPlugin((build) => {
  const { test } = build.input.pgRegistry.pgResources;
  if (!test) throw new Error("Resources not found");

  return {
    Mutation: {
      createTest(plan) {
        const $step = withPgClient(
          test.executor,
          list([]),
          async (_client) => {}
        );

        $step.hasSideEffects = true;
        return plan();
      },
    },
  };
});
