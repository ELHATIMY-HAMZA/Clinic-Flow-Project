-- 003_patients.sql
--
-- FK created_by → users ON DELETE SET NULL:
--   a patient record must outlive the staff account that registered it.

CREATE TABLE public.patients (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   varchar(150) NOT NULL,
  cin         varchar(20)  NOT NULL,
  phone       varchar(20)  NOT NULL,
  birth_date  date         NOT NULL,
  address     text,
  created_by  uuid         REFERENCES public.users (id) ON DELETE SET NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT patients_cin_uq UNIQUE (cin)   -- btree index → exact CIN lookups
);

-- Search: GET /api/patients?search=  →  full_name ILIKE '%x%' OR cin ILIKE '%x%'
-- A btree cannot serve a leading-wildcard ILIKE; trigram GIN indexes can.
CREATE INDEX patients_full_name_trgm_idx ON public.patients USING gin (full_name extensions.gin_trgm_ops);
CREATE INDEX patients_cin_trgm_idx       ON public.patients USING gin (cin extensions.gin_trgm_ops);

-- Default listing order (newest first) with LIMIT/OFFSET pagination.
CREATE INDEX patients_created_at_idx ON public.patients (created_at DESC);

-- FK column index (Postgres does not create one automatically).
CREATE INDEX patients_created_by_idx ON public.patients (created_by);

CREATE TRIGGER patients_set_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
