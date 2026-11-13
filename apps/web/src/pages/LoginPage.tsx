import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck, CheckCircle2, Lock, Mail, ShieldCheck, UserCog } from 'lucide-react';
import { motion } from 'motion/react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from '@clinicflow/shared';
import { useAuth } from '../auth/AuthContext.js';
import { Spotlight } from '../components/aceternity/Spotlight.js';
import { ClinicFlowLogo } from '../components/ClinicFlowLogo.js';
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
    <div className="min-h-screen bg-[#F4F7FB] lg:grid lg:grid-cols-12">
      {/* Left Column: Warm & Modern Healthcare Presentation Stage */}
      <section
        aria-label="Présentation de ClinicFlow"
        className="relative hidden overflow-hidden bg-[#0B1324] px-12 py-14 text-white lg:col-span-7 lg:flex lg:flex-col lg:justify-between xl:px-16"
      >
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-32" fill="#38BDF8" />

        {/* Top Brand Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <ClinicFlowLogo
            size="lg"
            variant="light"
            subtitle="Accueil patient & agenda médical"
          />
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1 text-[12px] font-medium text-sky-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Service continu 7j/7
          </span>
        </div>

        {/* Hero Copy + Clean Clinic Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 my-auto space-y-8 py-8"
        >
          <div className="max-w-xl space-y-4">
            <p className="text-[12px] font-semibold tracking-wider text-[#38BDF8] uppercase">
              VOTRE CABINET MÉDICAL AU QUOTIDIEN
            </p>
            <h1 className="text-[36px] leading-[1.14] font-bold tracking-tight text-white xl:text-[42px]">
              Un accueil patient fluide et un agenda toujours organisé.{' '}
              <span className="font-normal text-slate-300/80">
                Retrouvez chaque dossier et planifiez vos consultations en quelques clics.
              </span>
            </h1>
          </div>

          {/* Live Reception Preview Card (Simple & Human) */}
          <div className="max-w-xl space-y-4 rounded-[20px] border border-white/12 bg-[#111C33]/90 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="h-4 w-4 text-[#38BDF8]" aria-hidden="true" />
                <span className="text-[13px] font-semibold text-white">
                  Aperçu de l’agenda des consultations
                </span>
              </div>
              <span className="rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                Créneaux de 30 min
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-[#0B1324]/70 px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    09:00 · Mohamed Alaoui
                  </p>
                  <p className="text-[12px] text-slate-300">Consultation générale</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                  Confirmé
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-[#0B1324]/70 px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    10:30 · Fatima Zahra Bennani
                  </p>
                  <p className="text-[12px] text-slate-300">Suivi tension artérielle</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                  Confirmé
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-[#0B1324]/70 px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-white">11:00 · Karim Chraibi</p>
                  <p className="text-[12px] text-slate-300">Contrôle &amp; bilan</p>
                </div>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                  En attente
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1 text-[12px]">
              <div className="rounded-xl border border-white/8 bg-[#0B1324]/60 p-3">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                  Fiches patients
                </span>
                <p className="mt-1 text-slate-300/80">Recherche rapide par nom ou N° CIN</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0B1324]/60 p-3">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                  Zéro doublon
                </span>
                <p className="mt-1 text-slate-300/80">30 min réservées par rendez-vous confirmé</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0B1324]/60 p-3">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#38BDF8]" aria-hidden="true" />
                  Équipe médicale
                </span>
                <p className="mt-1 text-slate-300/80">Accès adapté Direction &amp; Accueil</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Footer Line */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-[12px] text-slate-400">
          <span>ClinicFlow — Solution de gestion pour cabinets et cliniques</span>
          <span>Assistance accueil</span>
        </div>
      </section>

      {/* Right Column: Login Form wrapped in ReactBits BorderGlow */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:col-span-5 xl:px-16">
        <div className="mx-auto w-full max-w-[420px]">
          {/* Mobile Brand Header */}
          <div className="mb-8 lg:hidden">
            <ClinicFlowLogo size="md" subtitle="Accueil patient & agenda médical" />
          </div>

          <BorderGlow className="p-7 sm:p-8">
            <div className="mb-6">
              <Badge variant="teal" className="mb-3">
                Espace professionnel
              </Badge>
              <h2
                id="login-heading"
                className="text-[22px] font-bold tracking-tight text-[#0F172A]"
              >
                Bienvenue.{' '}
                <span className="font-normal text-[#475569]">
                  Connectez-vous à votre espace cabinet.
                </span>
              </h2>
            </div>

            <form
              aria-labelledby="login-heading"
              onSubmit={onSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <Label htmlFor="login-email">Adresse e-mail</Label>
                <div className="relative mt-1.5">
                  <Mail
                    className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-[#64748B]"
                    aria-hidden="true"
                  />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'login-email-err' : undefined}
                    placeholder="nom@clinicflow.ma"
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
                    className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-[#64748B]"
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
                {isSubmitting ? 'Connexion en cours…' : 'Se connecter'}
              </Button>
            </form>

            {/* Quick-fill Demo Role Cards */}
            <div className="mt-7 border-t border-[#0F172A]/[0.08] pt-5">
              <p className="text-[12px] font-medium text-[#475569]">
                Accès rapide de démonstration (cliquez pour remplir) :
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => fillDemo('admin@clinicflow.ma', 'Admin123!')}
                  className="btn-taste flex items-start gap-2.5 rounded-xl border border-[#0F172A]/[0.1] bg-[#F4F7FB] p-3 text-left transition hover:border-[#0284C7] hover:bg-white"
                >
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0284C7]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#0F172A]">
                      Direction
                    </span>
                    <span className="block truncate text-[11px] text-[#64748B]">
                      Accès complet au cabinet
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemo('staff1@clinicflow.ma', 'Staff123!')}
                  className="btn-taste flex items-start gap-2.5 rounded-xl border border-[#0F172A]/[0.1] bg-[#F4F7FB] p-3 text-left transition hover:border-[#0284C7] hover:bg-white"
                >
                  <UserCog
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0F172A]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#0F172A]">
                      Accueil &amp; Secrétariat
                    </span>
                    <span className="block truncate text-[11px] text-[#64748B]">
                      Patients &amp; rendez-vous
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
