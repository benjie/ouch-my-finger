// @ts-check
import { makePgService } from "@dataplan/pg/adaptors/pg";
import AmberPreset from "postgraphile/presets/amber";
// import { makeV4Preset } from "postgraphile/presets/v4";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
// import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import PersistedPlugin from "@grafserv/persisted";
// import { PgOmitArchivedPlugin } from "@graphile-contrib/pg-omit-archived";

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

/** @satisfies {GraphileConfig.Preset} */
const preset = {
  extends: [
    AmberPreset.default ?? AmberPreset,
    PostGraphileConnectionFilterPreset,
    // PgManyToManyPreset,
    PgSimplifyInflectionPreset,
    PgAggregatesPreset,
  ],
  plugins: [
    PersistedPlugin.default,
    // PgOmitArchivedPlugin
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
  schema: {
    dontSwallowErrors: true
  },
  grafserv: {
    port: 5678,
    websockets: true,
    allowUnpersistedOperation: true,
  },
  grafast: {
    explain: true,
  },
};

export default preset;
