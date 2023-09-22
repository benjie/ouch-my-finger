// @ts-check
import { makePgService } from "@dataplan/pg/adaptors/pg";
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

import { gql, makeExtendSchemaPlugin } from 'postgraphile/utils';


const Pharmacy = makeExtendSchemaPlugin(() => {
	return {
		typeDefs: gql`
			interface IPharmacy {
				id: String!
			}

			type Pharmacy implements IPharmacy {
				id: String!
			}
		`,
	};
});


/** @satisfies {GraphileConfig.Preset} */
const preset = {
  extends: [
    AmberPreset.default,
    makeV4Preset({
      /* Enter your V4 options here */
      graphiql: true,
      graphiqlRoute: "/",
      appendPlugins: [Pharmacy]
    }),
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
