import pg from 'pg';
import { env } from './env.js';

// Return DATE columns as plain 'YYYY-MM-DD' strings (no timezone shift through JS Date).
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);
// COUNT(*) is bigint → parse to number (counts here are far below 2^53).
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => Number.parseInt(v, 10));

/**
 * Safely encodes reserved URI delimiters (`@`, `?`, `#`) inside the password segment
 * of a PostgreSQL URI if a user pasted an unencoded password into `DATABASE_URL`.
 */
function normalizeConnectionString(rawUrl: string): string {
  const match = /^(postgres(?:ql)?:\/\/)([^/]+)(\/.*)$/i.exec(rawUrl.trim());
  if (!match) return rawUrl;
  const [, scheme, authority, rest] = match;
  const lastAt = authority!.lastIndexOf('@');
  if (lastAt === -1) return rawUrl;
  const userInfo = authority!.slice(0, lastAt);
  const hostPort = authority!.slice(lastAt + 1);
  const colonIdx = userInfo.indexOf(':');
  if (colonIdx === -1) return rawUrl;
  const user = userInfo.slice(0, colonIdx);
  const rawPassword = userInfo.slice(colonIdx + 1);
  const encodedPassword = rawPassword
    .replace(/@/g, '%40')
    .replace(/\?/g, '%3F')
    .replace(/#/g, '%23');
  return `${scheme}${user}:${encodedPassword}@${hostPort}${rest}`;
}

export const pool = new pg.Pool({
  connectionString: normalizeConnectionString(env.DATABASE_URL),
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
