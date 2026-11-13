import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Stethoscope } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from '@clinicflow/shared';
import { useAuth } from '../auth/AuthContext.js';
import { getErrorMessage } from '../lib/utils.js';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const loggedIn = await login(values);
      toast.success(`Bienvenue, ${loggedIn.fullName}`);
      void navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Identifiants invalides'));
    }
  });

  function fillDemo(email: string, password: string) {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/25">
            <Stethoscope className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ClinicFlow</h1>
          <p className="mt-1 text-sm text-slate-300">
            Espace de gestion des patients et des rendez-vous
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
          <h2 id="login-heading" className="text-lg font-semibold text-slate-900">
            Connexion à votre compte
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Entrez vos identifiants professionnels pour accéder au portail.
          </p>

          <form
            aria-labelledby="login-heading"
            onSubmit={onSubmit}
            noValidate
            className="mt-6 space-y-4"
          >
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
                Adresse e-mail
              </label>
              <div className="relative mt-1">
                <Mail
                  className="pointer-events-none absolute top-2.5 left-3.5 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'login-email-err' : undefined}
                  placeholder="admin@clinicflow.ma"
                  className="block w-full rounded-xl border border-slate-300 py-2 pr-3.5 pl-10 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
                  {...register('email')}
                />
              </div>
              {errors.email ? (
                <p id="login-email-err" className="mt-1 text-xs text-rose-600">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="relative mt-1">
                <Lock
                  className="pointer-events-none absolute top-2.5 left-3.5 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'login-password-err' : undefined}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 py-2 pr-3.5 pl-10 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
                  {...register('password')}
                />
              </div>
              {errors.password ? (
                <p id="login-password-err" className="mt-1 text-xs text-rose-600">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500">Comptes de démonstration (seed) :</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@clinicflow.ma', 'Admin123!')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition hover:border-teal-300 hover:bg-teal-50/50"
              >
                <span className="block font-semibold text-slate-800">Administrateur</span>
                <span className="block truncate text-slate-500">admin@clinicflow.ma</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('staff1@clinicflow.ma', 'Staff123!')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition hover:border-teal-300 hover:bg-teal-50/50"
              >
                <span className="block font-semibold text-slate-800">Personnel (Staff)</span>
                <span className="block truncate text-slate-500">staff1@clinicflow.ma</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
