import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Lock, Mail, ShieldCheck, Stethoscope, UserCog } from 'lucide-react';
import { motion } from 'motion/react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from '@clinicflow/shared';
import { useAuth } from '../auth/AuthContext.js';
import { ClinicalPulseDiagram } from '../components/aceternity/BentoGrid.js';
import { Spotlight } from '../components/aceternity/Spotlight.js';
import { BorderGlow } from '../components/reactbits/BorderGlow.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Input, Label } from '../components/ui/Input.js';
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
    <div className="min-h-screen bg-[#f4f4f2] lg:grid lg:grid-cols-12">
      {/* Left Column: Dark Architectural Clinical Stage (Tech/Software Hero with Aceternity Spotlight & Live Diagram) */}
      <section
        aria-label="Présentation de la plateforme ClinicFlow"
        className="relative hidden overflow-hidden bg-[#090d10] px-12 py-14 text-white lg:col-span-7 lg:flex lg:flex-col lg:justify-between xl:px-16"
      >
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-32" fill="#14b8a6" />

        {/* Top Brand Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#12171c]">
              <Stethoscope className="h-5 w-5 text-[#14b8a6]" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-[17px] font-bold tracking-tight text-white">
                ClinicFlow
              </span>
              <span className="block font-mono text-[11px] text-white/55">
                PERN · PostgreSQL · Express 5 · React 19
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Supabase Session Pooler actif
          </span>
        </div>

        {/* Hero Copy + Real Product Fragment (`app-frame` + Live Diagram) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 my-auto space-y-8 py-8"
        >
          <div className="max-w-xl space-y-4">
            <p className="font-mono text-[12px] font-medium tracking-wide text-teal-400">
              GESTION CLINIQUE &amp; PLANIFICATION MÉDICALE
            </p>
            <h1 className="text-[36px] leading-[1.12] font-bold tracking-tight text-white xl:text-[42px]">
              Gérez vos patients et vos consultations sans conflit d’agenda.{' '}
              <span className="font-normal text-white/50">
                Chaque créneau confirmé est protégé à 30 minutes près.
              </span>
            </h1>
          </div>

          {/* Real Product UI Fragment inside a lit panel */}
          <div className="max-w-xl space-y-4 rounded-[20px] border border-white/12 bg-[#12171c]/90 p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-[13px] font-medium text-white">
                  Contrôle de planification en temps réel
                </span>
              </div>
              <span className="font-mono text-[11px] text-white/50">
                Africa/Casablanca · JWT HS256
              </span>
            </div>

            <ClinicalPulseDiagram />

            <div className="grid grid-cols-3 gap-3 pt-1 text-[12px]">
              <div className="rounded-xl border border-white/8 bg-[#090d10]/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                  CIN unique
                </span>
                <p className="mt-1 text-white/55">Recherche instantanée par index GIN trigrammes</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#090d10]/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                  Règle 30 min
                </span>
                <p className="mt-1 text-white/55">Contrainte PostgreSQL EXCLUDE anti-conflit</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#090d10]/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                  Rôles RBAC
                </span>
                <p className="mt-1 text-white/55">Accès différencié Administrateur &amp; Staff</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Footer Line */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-[12px] text-white/45">
          <span>ClinicFlow — Architecture PERN &amp; Validation Zod partagée</span>
          <span className="font-mono">v1.0</span>
        </div>
      </section>

      {/* Right Column: Login Form wrapped in ReactBits BorderGlow */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:col-span-5 xl:px-16">
        <div className="mx-auto w-full max-w-[420px]">
          {/* Mobile Brand Header */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c0f12] text-white">
              <Stethoscope className="h-5 w-5 text-[#14b8a6]" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-[18px] font-bold tracking-tight text-[#0c0f12]">
                ClinicFlow
              </span>
              <span className="block text-[12px] text-[#5a626a]">
                Gestion des patients et rendez-vous
              </span>
            </div>
          </div>

          <BorderGlow className="p-7 sm:p-8">
            <div className="mb-6">
              <Badge variant="teal" className="mb-3">
                Portail praticien sécurisé
              </Badge>
              <h2
                id="login-heading"
                className="text-[22px] font-bold tracking-tight text-[#0c0f12]"
              >
                Connexion au compte.{' '}
                <span className="font-normal text-[#5a626a]">Accédez à votre espace.</span>
              </h2>
            </div>

            <form
              aria-labelledby="login-heading"
              onSubmit={onSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <Label htmlFor="login-email">Adresse e-mail professionnelle</Label>
                <div className="relative mt-1.5">
                  <Mail
                    className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-[#5a626a]"
                    aria-hidden="true"
                  />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'login-email-err' : undefined}
                    placeholder="admin@clinicflow.ma"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email ? (
                  <p id="login-email-err" className="mt-1.5 text-[13px] text-rose-600">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="login-password">Mot de passe</Label>
                <div className="relative mt-1.5">
                  <Lock
                    className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-[#5a626a]"
                    aria-hidden="true"
                  />
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'login-password-err' : undefined}
                    placeholder="••••••••"
                    className="pl-10"
                    {...register('password')}
                  />
                </div>
                {errors.password ? (
                  <p id="login-password-err" className="mt-1.5 text-[13px] text-rose-600">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                withArrow
                className="mt-2 w-full"
              >
                {isSubmitting ? 'Authentification…' : 'Ouvrir la session'}
              </Button>
            </form>

            {/* Quick-fill Demo Role Cards */}
            <div className="mt-7 border-t border-[#0c0f12]/[0.08] pt-5">
              <p className="text-[12px] font-medium text-[#5a626a]">
                Comptes de démonstration (remplissage en 1 clic) :
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => fillDemo('admin@clinicflow.ma', 'Admin123!')}
                  className="btn-taste flex items-start gap-2.5 rounded-xl border border-[#0c0f12]/[0.12] bg-[#f4f4f2]/70 p-3 text-left transition hover:border-[#0d9488] hover:bg-white"
                >
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9488]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#0c0f12]">
                      Administrateur
                    </span>
                    <span className="block truncate font-mono text-[11px] text-[#5a626a]">
                      admin@clinicflow.ma
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemo('staff1@clinicflow.ma', 'Staff123!')}
                  className="btn-taste flex items-start gap-2.5 rounded-xl border border-[#0c0f12]/[0.12] bg-[#f4f4f2]/70 p-3 text-left transition hover:border-[#0d9488] hover:bg-white"
                >
                  <UserCog
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0c0f12]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#0c0f12]">
                      Personnel (Staff)
                    </span>
                    <span className="block truncate font-mono text-[11px] text-[#5a626a]">
                      staff1@clinicflow.ma
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </BorderGlow>
        </div>
      </main>
    </div>
  );
}
