-- 002_users.sql — application users (admin / staff)
--
-- Authentication is handled by the Express API (bcrypt + JWT), not by a BaaS,
-- so users live in our own table.

CREATE TABLE public.users (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     varchar(150) NOT NULL,
  email         varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  role          varchar(10)  NOT NULL DEFAULT 'staff',   -- 'admin' | 'staff' (validated by the API)
  created_at    timestamptz  NOT NULL DEFAULT now(),
  updated_at    timestamptz  NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness; also serves the login lookup (WHERE lower(email) = $1).
CREATE UNIQUE INDEX users_email_lower_uq ON public.users (lower(email));

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
