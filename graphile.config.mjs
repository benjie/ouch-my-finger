// @ts-check
import { makePgService } from "@dataplan/pg/adaptors/pg";
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
import { makeWrapPlansPlugin } from "graphile-utils";
import { lambda } from "postgraphile/grafast";
// import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

const BrokenExample = makeWrapPlansPlugin({
  Mutation: {
    createTest(plan, _$source, fieldArgs) {
      const $test = fieldArgs.get(["input", "test" ]);

      const $payload = plan();
      const $insert = $payload.get("result");
      const $testDep = lambda(
        $test,
        (test) => ({"test": "bad"}),
        true,
      );
      $insert.set("dep", $testDep);
    },
  }}
);


/** @satisfies {GraphileConfig.Preset} */
const preset = {
  extends: [
    AmberPreset.default ?? AmberPreset,
    makeV4Preset({
      /* Enter your V4 options here */
      graphiql: true,
      graphiqlRoute: "/",
    }),
    PostGraphileConnectionFilterPreset,
    PgManyToManyPreset,
    PgAggregatesPreset,
    // PgSimplifyInflectionPreset
  ],
  plugins: [
    BrokenExample,
  ],
  pgServices: [
    makePgService({
      // Database connection string:
      connectionString: process.env.DATABASE_URL,
      // List of schemas to expose:
      schemas: process.env.DATABASE_SCHEMAS?.split(",") ?? ["public"],
      // Enable LISTEN/NOTIFY:
      pubsub: true,
    }),
  ],
  grafserv: {
    port: 5678,
    websockets: true,
  },
  grafast: {
    explain: true,
  },
};

export default preset;
