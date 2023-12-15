// @ts-check
import { makePgService } from "@dataplan/pg/adaptors/pg";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import { TagsFilePlugin } from "postgraphile/utils";

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

/** @satisfies {GraphileConfig.Preset} */
const preset = {
  plugins: [TagsFilePlugin],
  extends: [PostGraphileAmberPreset, PgSimplifyInflectionPreset],
  pgServices: [
    makePgService({
      connectionString: "postgres:///mrjack",
      schemas: ["mrjack"],
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
