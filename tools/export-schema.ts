import { makeSchema } from "postgraphile";
import { exportSchema } from "graphile-export";
import preset from "../src/graphile.config.js";
// import * as didYouMean from "didyoumean";
// import CityTimezones from 'city-timezones';
// import lodash from 'lodash';

const main = async () => {
  console.log(`Exporting a GraphQL schema from the database at ${preset?.pgServices?.[0].name}...`);

  const { schema, resolvedPreset } = await makeSchema(preset);
  const exportFileLocation = `${__dirname}/src/exported-schema.js`;

  await exportSchema(schema, exportFileLocation, {
    mode: "typeDefs",
    // modules: {
    //   didYouMean: didYouMean,
    //   CityTimeZones: CityTimezones,
    //   lodash: lodash
    // }
  });


}

(async () => {
  await main();
})();
