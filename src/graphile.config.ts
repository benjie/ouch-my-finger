import { PgAggregatesPreset } from '@graphile/pg-aggregates';
import { PgSimplifyInflectionPreset } from '@graphile/simplify-inflection';
import {
  defaultPreset,
  MutationPayloadQueryPlugin,
  SwallowErrorsPlugin,
} from 'graphile-build';
import {
  defaultPreset as defaultPresetPg,
  PgAllRowsPlugin,
  PgAttributesPlugin,
  PgBasicsPlugin,
  PgCodecsPlugin,
  PgCustomTypeFieldPlugin,
  PgIntrospectionPlugin,
  PgMutationCreatePlugin,
  PgMutationUpdateDeletePlugin,
  PgOrderAllAttributesPlugin,
  PgOrderByPrimaryKeyPlugin,
  PgOrderCustomFieldsPlugin,
  PgRelationsPlugin,
  PgTablesPlugin,
  PgTypesPlugin,
} from 'graphile-build-pg';
import { makePgService } from 'postgraphile/adaptors/pg';
import { PostGraphileConnectionFilterPreset } from 'postgraphile-plugin-connection-filter';

interface PgConnectConfig {
  user: string
  database: string
  password: string
  host: string
  port: string
}

const pgConfig: PgConnectConfig = {
  user: process.env.TSDB_USERNAME! || 'postgres',
  password: process.env.TSDB_PASSWORD! || 'password',
  database: process.env.TSDB_DATABASE! || 'local_test',
  host: process.env.TSDB_HOST! || '127.0.0.1',
  port: process.env.TSDB_PORT! || '5432',
};

const connectionString = `postgres://${pgConfig.user}:${pgConfig.password}@${pgConfig.host}:${pgConfig.port}/${pgConfig.database}`;

const preset: GraphileConfig.Preset = {
  extends: [
    defaultPreset,
    defaultPresetPg,
    PgSimplifyInflectionPreset,
    PostGraphileConnectionFilterPreset,
    PgAggregatesPreset,
    PostGraphileAmberPreset,
  ],

  // Plugins taken from PostGraphileAmberPreset
  plugins: [
    // graphile_build.QueryQueryPlugin,
    PgBasicsPlugin,
    PgCodecsPlugin,
    PgTypesPlugin,
    PgIntrospectionPlugin,
    PgTablesPlugin,
    // AddNodeInterfaceToSuitableTypesPlugin,
    // NodePlugin,
    PgAllRowsPlugin,
    // PgRowByUniquePlugin,
    PgAttributesPlugin,
    MutationPayloadQueryPlugin,
    PgRelationsPlugin,
    PgMutationCreatePlugin,
    PgMutationUpdateDeletePlugin,
    PgCustomTypeFieldPlugin,
    // NodeAccessorPlugin,
    PgOrderAllAttributesPlugin,
    PgOrderCustomFieldsPlugin,
    PgOrderByPrimaryKeyPlugin,
    // graphile_build_pg.PgMutationPayloadEdgePlugin,
    SwallowErrorsPlugin,
  ],
  disablePlugins: ['NodePlugin'],

  pgServices: [makePgService({ connectionString })],

};

export default preset;
