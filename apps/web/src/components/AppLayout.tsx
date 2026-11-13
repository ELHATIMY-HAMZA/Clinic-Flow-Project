import {
  Calendar,
  Clock,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthContext.js';
import { cn } from '../lib/utils.js';
import { ClinicFlowLogo } from './ClinicFlowLogo.js';
import { Badge } from './ui/Badge.js';
import { Button } from './ui/Button.js';

const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', shortLabel: 'Accueil', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Dossiers patients', shortLabel: 'Patients', icon: Users, end: false },
  {
    to: '/appointments',
    label: 'Rendez-vous',
    shortLabel: 'Planning',
    icon: Calendar,
    end: false,
  },
] as const;

function getSectionLabel(pathname: string): string {
  if (pathname === '/') return 'Accueil & activité du jour';
  if (pathname.startsWith('/patients/')) return 'Fiche détaillée du patient';
  if (pathname.startsWith('/patients')) return 'Dossiers des patients';
  if (pathname.startsWith('/appointments')) return 'Agenda des consultations';
  return 'Espace cabinet médical';
}

function getRoleLabel(role?: string): string {
  if (role === 'admin') return 'Direction';
  return 'Accueil';
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sectionLabel = getSectionLabel(location.pathname);

  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0F172A] lg:grid lg:grid-cols-[272px_1fr]">
      {/* Accessible skip link */}
      <a href="#top" className="skip-link">
        Aller au contenu principal
      </a>

      {/* Mobile Sticky Top Header (< 1024px) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#0F172A]/[0.08] bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:hidden">
        <ClinicFlowLogo size="sm" subtitle={sectionLabel} />

        {user ? (
          <div className="flex items-center gap-2">
            <Badge variant={user.role === 'admin' ? 'ink' : 'teal'}>
              {user.role === 'admin' ? (
                <ShieldCheck className="h-3 w-3 text-[#38BDF8]" aria-hidden="true" />
              ) : null}
              <span>{getRoleLabel(user.role)}</span>
            </Badge>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={logout}
              aria-label="Se déconnecter"
              className="min-h-[44px] px-3"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        ) : null}
      </header>

      {/* Desktop Sidebar (>= 1024px) */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-[#0F172A]/[0.08] lg:bg-white">
        <div className="flex items-center justify-between border-b border-[#0F172A]/[0.07] px-6 py-5">
          <ClinicFlowLogo size="md" subtitle="Gestion de cabinet médical" />
        </div>

        <nav
          aria-label="Navigation principale"
          className="flex flex-1 flex-col gap-1.5 px-3.5 py-5"
        >
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            Menu principal
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'text-[#0F172A]'
                    : 'text-[#475569] hover:bg-[#F4F7FB] hover:text-[#0F172A]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      transition={{ type: 'spring', bounce: 0, duration: 0.24 }}
                      className="absolute inset-0 rounded-xl border border-[#0284C7]/20 bg-[#F0F9FF]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-[#F4F7FB] text-[#475569]',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </span>
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Helpful Clinic Reception Info Card */}
          <div className="mt-auto rounded-2xl border border-[#0284C7]/15 bg-[#F0F9FF]/70 p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0369A1]">
                <Clock className="h-3.5 w-3.5 text-[#0284C7]" aria-hidden="true" />
                Horaires du cabinet
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Ouvert
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-[#475569]">
              Lun – Sam · 08h30 à 19h00. Durée standard : 30 min par consultation.
            </p>
          </div>
        </nav>

        {user ? (
          <div className="border-t border-[#0F172A]/[0.08] bg-[#F4F7FB]/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[#0F172A]">
                  {user.fullName}
                </p>
                <p className="truncate text-[12px] text-[#64748B]">{user.email}</p>
              </div>
              <Badge variant={user.role === 'admin' ? 'ink' : 'teal'}>
                {user.role === 'admin' ? (
                  <ShieldCheck className="h-3 w-3 text-[#38BDF8]" aria-hidden="true" />
                ) : null}
                <span>{getRoleLabel(user.role)}</span>
              </Badge>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={logout}
              className="mt-3 w-full"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Se déconnecter
            </Button>
          </div>
        ) : null}
      </aside>

      {/* Right Column: Desktop Top Context Bar + Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop Workspace Context Bar */}
        <div className="hidden items-center justify-between border-b border-[#0F172A]/[0.07] bg-white/85 px-10 py-3.5 backdrop-blur-md lg:flex">
          <div className="flex items-center gap-2.5 text-[13px]">
            <span className="font-medium text-[#64748B]">Cabinet médical</span>
            <span className="text-[#0F172A]/25">/</span>
            <span className="font-semibold text-[#0F172A]">{sectionLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-[#0F172A]/[0.07] bg-[#F4F7FB] px-3 py-1 text-[12px] font-medium text-[#475569] capitalize">
              <Calendar className="h-3.5 w-3.5 text-[#0284C7]" aria-hidden="true" />
              {todayFormatted}
            </span>
          </div>
        </div>

        {/* Main Content Workspace — Equal Left & Right Edges */}
        <main
          id="top"
          className="mx-auto w-full max-w-[1260px] flex-1 px-4 pt-5 pb-28 sm:px-6 md:px-8 lg:px-10 lg:py-9"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (< 1024px) */}
      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#0F172A]/[0.09] bg-white/95 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {NAV_ITEMS.map(({ to, shortLabel, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-[#0284C7]' : 'text-[#64748B] hover:text-[#0F172A]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      layoutId="mobile-bottom-nav-pill"
                      transition={{ type: 'spring', bounce: 0, duration: 0.24 }}
                      className="absolute inset-0 rounded-xl border border-[#0284C7]/20 bg-[#F0F9FF]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <Icon
                    className={cn(
                      'relative z-10 h-4 w-4 transition-colors',
                      isActive ? 'text-[#0284C7]' : 'text-[#64748B]',
                    )}
                    aria-hidden="true"
                  />
                  <span className="relative z-10">{shortLabel}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
