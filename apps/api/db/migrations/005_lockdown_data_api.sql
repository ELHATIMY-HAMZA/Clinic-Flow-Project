-- 005_lockdown_data_api.sql
--
-- On Supabase, every table in the "public" schema is reachable through the auto-generated
-- REST API (PostgREST) with the public "anon" key. ClinicFlow only talks to the database
-- through its Express API, so we close that door completely:
--   1. RLS enabled with NO policy  → deny-all for anon / authenticated.
--   2. Explicit REVOKE              → the tables are not even visible to those roles.
-- The API connects as the table owner (postgres), which bypasses RLS, so it is unaffected.
-- On a plain PostgreSQL (local docker) the anon/authenticated roles do not exist: step 2 is skipped.

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON public.users, public.patients, public.appointments, public.schema_migrations
      FROM anon, authenticated;
    REVOKE EXECUTE ON FUNCTION public.appointment_window(timestamptz) FROM anon, authenticated, PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, PUBLIC;
  END IF;
END
$$;
