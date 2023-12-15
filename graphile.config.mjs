// @ts-check
import { makePgService } from "@dataplan/pg/adaptors/pg";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import { PostGraphileRelayPreset } from "postgraphile/presets/relay";
import { custom as makePgOmitArchivedPlugin } from "@graphile-contrib/pg-omit-archived";
import PersistedPlugin from "@grafserv/persisted";

const isProduction = false;

/** @type {GraphileConfig.Preset} */
const preset = {
  extends: [
    PostGraphileAmberPreset,
    PostGraphileRelayPreset,
    PgSimplifyInflectionPreset,
    PgAggregatesPreset,
    PostGraphileConnectionFilterPreset,
    PgManyToManyPreset,
    makeV4Preset({
      // dynamicJson: true,
      // ignoreRBAC: false,
      // setofFunctionsContainNulls: false,
      // subscriptions: true,
      //   graphileBuildOptions: {
      // nestedMutationsSimpleFieldNames: true,
      // nestedMutationsDeleteOthers: true,
      //   },
    }),
  ],

  gather: {
    // pgStrictFunctions: true,
    installWatchFixtures: false, // need to install manually
  },

  grafast: {
    // context: async (ctx, args) => {
    //   return {};
    // },
  },

  grafserv: {
    allowUnpersistedOperation: (event) => {
      return !isProduction;
      //&& !!event.request?.getHeader("referer")?.endsWith("/graphiql")
    },
    // persistedOperations: { ...persistedOperations },
    // port: process.env["PORT"] ? Number(process.env["PORT"]) : 4001,
    ...(isProduction
      ? {}
      : {
          graphiql: true,
          graphiqlPath: "/graphiql",
          watch: true,
        }),
  },

  inflection: {},

  plugins: [makePgOmitArchivedPlugin("archived"), PersistedPlugin.default],

  pgServices: [
    makePgService({
      connectionString: process.env["DATABASE_URL"] ?? "postgres:///litewarp",
      schemas: ["app_public", "app_private", "public", "case_mgmt"],
    }),
  ],
  schema: {
    ...(isProduction
      ? { retryOnInitFail: true }
      : {
          exportSchemaSDLPath: "schema.graphql",
          sortExport: true,
          // dontSwallowErrors: true,
        }),
    connectionFilterRelations: true,
    connectionFilterAllowNullInput: true,
    connectionFilterAllowEmptyObjectInput: true,
    pgArchivedColumnName: "archived_at",
    pgArchivedRelations: true,
    pgArchivedDefault: "NO",
    pgJwtSecret: process.env.JWT_SECRET ?? "",
  },
};

export default preset;
