import express from "express";
import { grafserv } from "grafserv/express/v4";
import { postgraphile } from "postgraphile";
import preset from "./graphile.config.mjs";

// Create an express app
const app = express();

// Create a PostGraphile instance
const pgl = postgraphile(preset);
// And extract the resolved preset
const resolvedPreset = pgl.getResolvedPreset();

// Create a Grafserv instance using the grafserv/express/v4 adaptor
const serv = pgl.createServ(grafserv);

// Mount our Grafserv instance into our Express app
serv.addTo(app);

// Start the Express server
const port = resolvedPreset.grafserv.port ?? 5678;
const host = resolvedPreset.grafserv.host ?? "127.0.0.1";
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}/`);
});
