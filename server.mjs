import express from "express";
import { grafserv } from "grafserv/express/v4";
import { postgraphile, makePgSources } from "postgraphile";
import preset from "./graphile.config.mjs";

// Create an express app
const app = express();

const instance = postgraphile({
  extends: [preset],
  pgSources: makePgSources(
    // Database connection string:
    process.env.DATABASE_URL,
    // List of schemas to expose:
    process.env.DATABASE_SCHEMAS?.split(",") ?? ["public"]
  ),
});

const serv = instance.createServ(grafserv);
serv.addTo(app);

// Start the Express server
const port = preset.server.port ?? 5678;
app.listen(port, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${port}/`);
});
