import "graphile-config";
import { object, sideEffect, constant } from "postgraphile/grafast";
import { makePgService } from "@dataplan/pg/adaptors/pg";
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { makePgSmartTagsFromFilePlugin } from "postgraphile/utils";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
// import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import PersistedPlugin from "@grafserv/persisted";
import { PgOmitArchivedPlugin } from "@graphile-contrib/pg-omit-archived";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { extendSchema, gql } from "postgraphile/utils";
import { pgSelect, TYPES} from "postgraphile/@dataplan/pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

const BreakPlannerRelPlugin = extendSchema((build) => {
  const resource = build.pgResources?.test
  if (!resource) {
    throw new Error(`${name} doesn't exist in pgRegistry`);
  }

  return {
    typeDefs: gql`
      extend type Query {
        somethingRelated(
          organizationId: String!
          organizationOrbId: String!
          userId: String!
        ): Test
      }

      extend type Test {
        test: Boolean
      }

    `,
    objects: {
      Query: {
        plans: {
          somethingRelated(_query, args, context, resolveInfo) {
            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });
            const $record = pgSelect({
              identifiers: [],
              resource,
              // biome-ignore lint/suspicious/noExplicitAny: fromeslint
              from: (r: any) =>
                build.sql`json_populate_record(null::public.test, ${r.placeholder})`,
              args: [{ step: constant([]), pgCodec: TYPES.json }],
            });
            return $record.single();
          }
        }
      }

    }
  }
})


const BreakPlannerPlugin = extendSchema((build) => {
  return {
    typeDefs: gql`
        type Payload {
        ok: Boolean!
        query: Query
      }

      extend type Mutation {
        breakStuff: Payload
      }

    `,
    objects: {
      Mutation: {
        plans: {
          breakStuff() {
            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });

            sideEffect([], async () => {
              return [];
            });
            return object({ok: constant(true)});
          }
        }
      }
    }
  }
});

const TagsFilePlugin = makePgSmartTagsFromFilePlugin(`${__dirname}/tags.json5`);

const preset: GraphileConfig.Preset = {
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
  plugins: [PersistedPlugin.default, PgOmitArchivedPlugin, TagsFilePlugin, BreakPlannerPlugin, BreakPlannerRelPlugin],
  pgServices: [
    makePgService({
      // Database connection string:
      connectionString: process.env.DATABASE_URL,
      superuserConnectionString:
        process.env.SUPERUSER_DATABASE_URL ?? process.env.DATABASE_URL,
      // List of schemas to expose:
      schemas: process.env.DATABASE_SCHEMAS?.split(",") ?? ["public"],
      // Enable LISTEN/NOTIFY:
      pubsub: true,
    }),
  ],
  grafserv: {
    port: 5678,
    websockets: true,
    allowUnpersistedOperation: true,
    watch: true,
  },
  grafast: {
    explain: true,
  },
};

export default preset;
