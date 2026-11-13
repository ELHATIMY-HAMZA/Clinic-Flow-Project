/**
 * Minimal, transparent SQL migration runner.
 *
 *   npm run db:migrate            apply pending migrations (db/migrations/*.sql, in name order)
 *   npm run db:migrate -- --reset drop all ClinicFlow objects, then re-apply everything
 *
 * Each file runs in its own transaction and is recorded in public.schema_migrations,
 * so the runner is idempotent and safe to call on every container start.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/db.js';

const here = dirname(fileURLToPath(import.meta.url));
// Works both from source (db/migrate.ts) and compiled output (dist/db/migrate.js).
const MIGRATIONS_DIR = [join(here, 'migrations'), join(here, '../../db/migrations')].find(existsSync);

async function reset(): Promise<void> {
  if (env.NODE_ENV === 'production') throw new Error('Refusing to reset the database in production');
  console.log('⚠️  Resetting database objects…');
  await pool.query(`
    DROP TABLE    IF EXISTS public.appointments, public.patients, public.users, public.schema_migrations CASCADE;
    DROP FUNCTION IF EXISTS public.appointment_window(timestamptz);
    DROP FUNCTION IF EXISTS public.set_updated_at();
  `);
}

async function migrate(): Promise<void> {
  if (!MIGRATIONS_DIR) throw new Error('Migrations directory not found');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      name       varchar(255) PRIMARY KEY,
      applied_at timestamptz  NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await pool.query<{ name: string }>('SELECT name FROM public.schema_migrations');
  const applied = new Set(rows.map((r) => r.name));
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO public.schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✔ applied ${file}`);
      count++;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      console.error(`✖ failed ${file}`);
      throw err;
    } finally {
      client.release();
    }
  }
  console.log(count ? `✅ ${count} migration(s) applied` : '✅ database is up to date');
}

try {
  if (process.argv.includes('--reset')) await reset();
  await migrate();
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
