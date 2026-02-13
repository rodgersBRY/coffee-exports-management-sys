import { readFileSync } from "node:fs";

import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

import { env } from "../config/env.js";

const ssl =
  env.dbSslMode === "require"
    ? {
        rejectUnauthorized: env.dbSslRejectUnauthorized,
        ca: env.dbSslCaPath ? readFileSync(env.dbSslCaPath, "utf-8") : undefined,
      }
    : undefined;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
