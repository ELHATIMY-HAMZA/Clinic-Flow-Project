-- 004_appointments.sql
--
-- FK patient_id → patients ON DELETE CASCADE:
--   an appointment has no meaning without its patient; deleting a patient (admin only)
--   removes its appointments, leaving no orphan rows.
-- FK created_by → users ON DELETE RESTRICT:
--   traceability — a user who booked appointments cannot be deleted.

-- [t - 15min, t + 15min) — two such windows overlap  ⇔  |t1 - t2| < 30 minutes.
-- (timestamptz ± interval is only STABLE in Postgres because of day/month intervals and DST;
--  a pure minutes interval is timezone-independent, so declaring this wrapper IMMUTABLE is safe
--  and required to use it inside an index/constraint expression.)
CREATE OR REPLACE FUNCTION public.appointment_window(ts timestamptz)
RETURNS tstzrange
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT pg_catalog.tstzrange(ts - interval '15 minutes', ts + interval '15 minutes', '[)')
$$;

CREATE TABLE public.appointments (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       uuid         NOT NULL REFERENCES public.patients (id) ON DELETE CASCADE,
  appointment_date timestamptz  NOT NULL,
  status           varchar(10)  NOT NULL DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'cancelled'
  reason           varchar(255) NOT NULL,
  notes            text,
  created_by       uuid         NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now(),

  -- BUSINESS RULE: a patient cannot have 2 *confirmed* appointments within a 30-minute window.
  -- Enforced by the database itself, so it holds even under concurrent requests.
  CONSTRAINT appointments_no_confirmed_overlap_30min
    EXCLUDE USING gist (
      patient_id WITH =,
      public.appointment_window(appointment_date) WITH &&
    ) WHERE (status = 'confirmed')
);

-- GET /api/appointments?date=           → range scan on appointment_date
CREATE INDEX appointments_date_idx         ON public.appointments (appointment_date);
-- GET /api/appointments?status=&date=   + dashboard counters
CREATE INDEX appointments_status_date_idx  ON public.appointments (status, appointment_date);
-- Patient details page (appointments of one patient, most recent first) + FK index
CREATE INDEX appointments_patient_date_idx ON public.appointments (patient_id, appointment_date DESC);
-- FK column index
CREATE INDEX appointments_created_by_idx   ON public.appointments (created_by);

CREATE TRIGGER appointments_set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
