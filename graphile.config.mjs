// @ts-check
import "postgraphile"; // For TypeScript
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";

/** @type {GraphileConfig.Preset} */
const preset = {
  extends: [
    AmberPreset.default,
    makeV4Preset({
      /* Enter your V4 options here */
    }),
    PostGraphileConnectionFilterPreset,
    PgManyToManyPreset,
    PgAggregatesPreset,
  ],
  server: {
    port: 5678,
  },
  grafast: {
    explain: true,
  },
};
export default preset;
