import { makeSchema } from "postgraphile";
import { exportSchema } from "graphile-export";
import preset from "../src/graphile.config.js";

const main = async () => {
  console.log(`Exporting a GraphQL schema from the database at ${preset?.pgServices?.[0].name}...`);

  const { schema, resolvedPreset } = await makeSchema(preset);
  const exportFileLocation = `${__dirname}/src/exported-schema.js`;

  await exportSchema(schema, exportFileLocation, {
    mode: "typeDefs",
  });


}

(async () => {
  await main();
})();
