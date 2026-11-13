import { Calendar, LayoutDashboard, LogOut, ShieldCheck, Stethoscope, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../auth/AuthContext.js';
import { cn } from '../lib/utils.js';
import { Badge } from './ui/Badge.js';
import { Button } from './ui/Button.js';

const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Patients', icon: Users, end: false },
  { to: '/appointments', label: 'Rendez-vous', icon: Calendar, end: false },
] as const;

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-[#0c0f12] lg:grid lg:grid-cols-[268px_1fr]">
      {/* Accessible skip link (design-taste-frontend house rule) */}
      <a href="#top" className="skip-link">
        Aller au contenu principal
      </a>

      {/* Architectural Sidebar */}
      <aside className="flex flex-col border-b border-[#0c0f12]/[0.11] bg-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between border-b border-[#0c0f12]/[0.08] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c0f12] text-white">
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
          className="flex gap-1.5 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:py-5"
        >
          <p className="hidden px-3 pb-2 text-[12px] font-medium text-[#5a626a] lg:block">
            Espace de travail
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium whitespace-nowrap transition-colors',
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

      {/* Main Content Workspace — Equal Left & Right Edges */}
      <main id="top" className="mx-auto w-full max-w-[1240px] px-6 py-8 sm:px-8 lg:px-12 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
