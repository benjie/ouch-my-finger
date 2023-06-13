// Run this with `npx ts-node postgraphile-express-typescript-example.ts`
import preset from "./graphile.config.js";
import { postgraphile } from "postgraphile";

// Our PostGraphile instance:
export const pgl = postgraphile(preset);

import { createServer } from "node:http";
import express from "express";
import { grafserv } from "grafserv/express/v4";

const serv = pgl.createServ(grafserv);

const app = express();
const server = createServer(app);
server.on("error", () => {});
serv.addTo(app, server).catch((e) => {
  console.error(e);
  process.exit(1);
});
server.listen(5678);

console.log("Server listening at http://localhost:5678");
