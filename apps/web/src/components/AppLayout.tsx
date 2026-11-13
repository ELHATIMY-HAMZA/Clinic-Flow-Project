import {
  Activity,
  Calendar,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthContext.js';
import { cn } from '../lib/utils.js';
import { Badge } from './ui/Badge.js';
import { Button } from './ui/Button.js';

const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', shortLabel: 'Accueil', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Patients', shortLabel: 'Patients', icon: Users, end: false },
  {
    to: '/appointments',
    label: 'Rendez-vous',
    shortLabel: 'Planning',
    icon: Calendar,
    end: false,
  },
] as const;

function getSectionLabel(pathname: string): string {
  if (pathname === '/') return 'Vue d’ensemble clinique';
  if (pathname.startsWith('/patients/')) return 'Fiche détaillée du patient';
  if (pathname.startsWith('/patients')) return 'Répertoire des dossiers patients';
  if (pathname.startsWith('/appointments')) return 'Planning & gestion des créneaux';
  return 'Espace clinique';
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sectionLabel = getSectionLabel(location.pathname);

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-[#0c0f12] lg:grid lg:grid-cols-[272px_1fr]">
      {/* Accessible skip link (design-taste-frontend house rule) */}
      <a href="#top" className="skip-link">
        Aller au contenu principal
      </a>

      {/* Mobile Sticky Top Header (< 1024px) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#0c0f12]/[0.09] bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c0f12] text-white">
            <Stethoscope className="h-4 w-4 text-[#14b8a6]" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-[15px] leading-tight font-bold tracking-tight text-[#0c0f12]">
              ClinicFlow
            </span>
            <span className="block text-[11px] text-[#5a626a]">{sectionLabel}</span>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <Badge variant={user.role === 'admin' ? 'ink' : 'teal'}>
              {user.role === 'admin' ? (
                <ShieldCheck className="h-3 w-3 text-[#14b8a6]" aria-hidden="true" />
              ) : null}
              <span>{user.role}</span>
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

      {/* Architectural Desktop Sidebar (>= 1024px) */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-[#0c0f12]/[0.11] lg:bg-white">
        <div className="flex items-center justify-between border-b border-[#0c0f12]/[0.08] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c0f12] text-white shadow-xs">
              <Stethoscope className="h-5 w-5 text-[#14b8a6]" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-[17px] font-bold tracking-tight text-[#0c0f12]">
                ClinicFlow
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-[#5a626a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0d9488]" />
                Système clinique PERN
              </span>
            </div>
          </div>
        </div>

        <nav
          aria-label="Navigation principale"
          className="flex flex-1 flex-col gap-1.5 px-3.5 py-5"
        >
          <p className="px-3 pb-2 font-mono text-[11px] font-medium tracking-wider text-[#5a626a] uppercase">
            Espace de travail
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
                    ? 'text-[#0c0f12]'
                    : 'text-[#5a626a] hover:bg-[#f4f4f2] hover:text-[#0c0f12]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      transition={{ type: 'spring', bounce: 0, duration: 0.24 }}
                      className="absolute inset-0 rounded-xl border border-[#0c0f12]/[0.12] bg-[#f4f4f2]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'relative z-10 flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-[#0d9488] text-white'
                        : 'bg-[#f4f4f2] text-[#5a626a]',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </span>
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Infrastructure Status Card inside Desktop Sidebar */}
          <div className="mt-auto rounded-2xl border border-[#0c0f12]/[0.08] bg-[#f4f4f2]/70 p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold text-[#0c0f12]">
                INFRASTRUCTURE
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                En ligne
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-[#5a626a]">
              PostgreSQL 17 · Protection GiST 30 min active
            </p>
          </div>
        </nav>

        {user ? (
          <div className="border-t border-[#0c0f12]/[0.09] bg-[#f4f4f2]/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[#0c0f12]">
                  {user.fullName}
                </p>
                <p className="truncate font-mono text-[12px] text-[#5a626a]">{user.email}</p>
              </div>
              <Badge variant={user.role === 'admin' ? 'ink' : 'teal'}>
                {user.role === 'admin' ? (
                  <ShieldCheck className="h-3 w-3 text-[#14b8a6]" aria-hidden="true" />
                ) : null}
                <span>{user.role}</span>
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

      {/* Right Column: Desktop Top Workspace Bar + Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop Workspace Context Bar */}
        <div className="hidden items-center justify-between border-b border-[#0c0f12]/[0.08] bg-white/80 px-10 py-3.5 backdrop-blur-md lg:flex">
          <div className="flex items-center gap-2.5 text-[13px]">
            <span className="font-medium text-[#5a626a]">ClinicFlow</span>
            <span className="text-[#0c0f12]/25">/</span>
            <span className="font-semibold text-[#0c0f12]">{sectionLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#0c0f12]/[0.08] bg-[#f4f4f2] px-2.5 py-1 font-mono text-[11px] text-[#5a626a]">
              <Activity className="h-3.5 w-3.5 text-[#0d9488]" aria-hidden="true" />
              API Express 5 · JWT RBAC
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

      {/* Mobile Fixed Bottom Navigation Bar (< 1024px) — 48px+ touch targets & safe-area support */}
      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#0c0f12]/[0.11] bg-white/95 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
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
                  isActive ? 'text-[#0c0f12]' : 'text-[#5a626a] hover:text-[#0c0f12]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      layoutId="mobile-bottom-nav-pill"
                      transition={{ type: 'spring', bounce: 0, duration: 0.24 }}
                      className="absolute inset-0 rounded-xl border border-[#0c0f12]/[0.1] bg-[#f4f4f2]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <Icon
                    className={cn(
                      'relative z-10 h-4 w-4 transition-colors',
                      isActive ? 'text-[#0d9488]' : 'text-[#5a626a]',
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
