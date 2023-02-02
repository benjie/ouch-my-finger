// @ts-check
import { makePgSources } from "postgraphile";
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

/** @type {GraphileConfig.Preset} */
const preset = {
  extends: [
    AmberPreset.default ?? AmberPreset,
    makeV4Preset({
      /* Enter your V4 options here */
    }),
    PostGraphileConnectionFilterPreset,
    PgManyToManyPreset,
    PgAggregatesPreset,
  ],
  pgSources: makePgSources(
    // Database connection string:
    process.env.DATABASE_URL,
    // List of schemas to expose:
    process.env.DATABASE_SCHEMAS?.split(",") ?? ["public"]
  ),
  server: {
    port: 5678,
  },
  grafast: {
    explain: true,
  },
};

export default preset;
