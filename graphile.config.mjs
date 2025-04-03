// @ts-check
import jwt from 'jsonwebtoken'
import { makePgService } from "@dataplan/pg/adaptors/pg";
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { makePgSmartTagsFromFilePlugin } from "postgraphile/utils";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
import PersistedPlugin from "@grafserv/persisted";
import { PgOmitArchivedPlugin } from "@graphile-contrib/pg-omit-archived";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SubscriptionsPlugin } from './subscriptions.mjs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

const TagsFilePlugin = makePgSmartTagsFromFilePlugin(`${__dirname}/tags.json5`);

/** @satisfies {GraphileConfig.Preset} */
const preset = {
  extends: [
    AmberPreset.default ?? AmberPreset,
    makeV4Preset({
      /* Enter your V4 options here */
      graphiql: true,
      graphiqlRoute: "/",
    }),
    PostGraphileConnectionFilterPreset,
    PgManyToManyPreset,
    PgAggregatesPreset,
    // PgSimplifyInflectionPreset
  ],
  plugins: [PersistedPlugin.default, PgOmitArchivedPlugin, TagsFilePlugin, SubscriptionsPlugin],
  pgServices: [
    makePgService({
      // Database connection string:
      connectionString: process.env.DATABASE_URL,
      superuserConnectionString:
        process.env.SUPERUSER_DATABASE_URL ?? process.env.DATABASE_URL,
      // List of schemas to expose:
      schemas: process.env.DATABASE_SCHEMAS?.split(",") ?? ["public"],
      // Enable LISTEN/NOTIFY:
      pubsub: true,
    }),
  ],
  grafserv: {
    port: 5678,
    websockets: true,
    allowUnpersistedOperation: true,
    watch: true,
  },
  grafast: {
    explain: true,
    context: (ctx, args) => {
      // grab any the auth header, if present, from either the http headers or the websocket connection params
      const authorization = ctx.node?.req?.headers?.authorization || ctx.ws?.connectionParams?.authorization || ''
      const pgSettings = {}

      if (authorization) {
        // parse the auth header, to get the actual jwt
        const [bearer, token] = authorization.split(' ')

        if (bearer.toLowerCase() === 'bearer') {
          try {
            // decode and verify the jwt with supabase's secret, checking that the claims are as we expect
            const claims = jwt.verify(token, 'secret', {
              algorithms: ['HS256']
            })

            if (claims.role) {
              pgSettings.role = claims.role
            }

            pgSettings['request.jwt.claims'] = JSON.stringify(claims)
          } catch (err) {
            console.warn('[api] error parsing jwt', err)
          }
        }
      }

      return {
        pgSettings
      }
    },
  },
};

export default preset;
