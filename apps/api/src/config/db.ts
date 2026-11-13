import pg from 'pg';
import { env } from './env.js';

// Return DATE columns as plain 'YYYY-MM-DD' strings (no timezone shift through JS Date).
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);
// COUNT(*) is bigint → parse to number (counts here are far below 2^53).
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => Number.parseInt(v, 10));

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  // Supabase requires TLS; the pooler certificate is not in the default CA bundle.
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (err) => {
  // An idle client errored (e.g. network blip) — log it, the pool will replace it.
  console.error('Unexpected PostgreSQL pool error', err);
});

export type DbClient = pg.PoolClient | pg.Pool;

/** Runs `fn` inside a transaction, committing on success and rolling back on error. */
export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}
