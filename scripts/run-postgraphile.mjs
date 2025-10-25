#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_DB_NAME = "pg_aggregates_connection_filter_repro";
const dbName = process.env.REPRO_DATABASE ?? DEFAULT_DB_NAME;
const schemaFile = resolve(__dirname, "..", "schema.sql");

function runSync(command, args, { allowFailure } = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    if (allowFailure?.(result)) {
      return result;
    }

    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    const details = [stderr, stdout].filter(Boolean).join("\n");
    throw new Error(
      `Command failed: ${command} ${args.join(" ")}${details ? `\n${details}` : ""}`,
    );
  }

  return result;
}

function ensureDatabase() {
  const createResult = runSync("createdb", [dbName], {
    allowFailure(result) {
      return (
        result.status !== 0 &&
        /database .* already exists/i.test(result.stderr ?? "")
      );
    },
  });

  if (createResult.status === 0) {
    console.log(`Created database '${dbName}'.`);
  } else {
    console.log(`Database '${dbName}' already exists; skipping create.`);
  }
}

function applySchema() {
  console.log(`Applying schema from ${schemaFile}...`);
  const schemaResult = runSync("psql", [
    dbName,
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    schemaFile,
  ]);
  if (schemaResult.stdout) {
    process.stdout.write(schemaResult.stdout);
  }
  if (schemaResult.stderr) {
    process.stderr.write(schemaResult.stderr);
  }
}

function startPostgraphile() {
  const databaseUrl = process.env.DATABASE_URL ?? `postgres:///${dbName}`;
  const databaseSchemas = process.env.DATABASE_SCHEMAS ?? "app_public";
  const inheritedNodeOptions = process.env.NODE_OPTIONS ?? "";
  const nodeOptions = inheritedNodeOptions
    .split(/\s+/)
    .filter(Boolean)
    .concat("--experimental-strip-types")
    .join(" ");

  const childEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    DATABASE_SCHEMAS: databaseSchemas,
    NODE_OPTIONS: nodeOptions,
    GRAPHILE_ENV: process.env.GRAPHILE_ENV ?? "development",
  };

  console.log(
    `Starting PostGraphile with DATABASE_URL='${childEnv.DATABASE_URL}' and DATABASE_SCHEMAS='${childEnv.DATABASE_SCHEMAS}'.`,
  );

  const child = spawn("postgraphile", process.argv.slice(2), {
    stdio: "inherit",
    env: childEnv,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  child.on("error", (error) => {
    console.error("Failed to start PostGraphile:", error);
    process.exit(1);
  });

  process.on("SIGINT", () => {
    child.kill("SIGINT");
  });

  process.on("SIGTERM", () => {
    child.kill("SIGTERM");
  });
}

try {
  ensureDatabase();
  applySchema();
  startPostgraphile();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

