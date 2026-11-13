-- 001_init.sql — extensions & shared helpers
--
-- Extensions are installed in a dedicated "extensions" schema (Supabase convention,
-- also keeps "public" clean on a plain PostgreSQL).
--   * pg_trgm    → trigram GIN indexes for fast ILIKE '%term%' search (patients)
--   * btree_gist → allows "uuid WITH =" inside a GiST EXCLUDE constraint (appointments)
-- gen_random_uuid() is built into PostgreSQL 13+, no extension needed for UUID PKs.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm    WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

-- Keeps updated_at in sync on every UPDATE.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
