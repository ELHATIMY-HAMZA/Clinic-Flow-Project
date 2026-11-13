import { Calendar, LayoutDashboard, LogOut, ShieldCheck, Stethoscope, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../auth/AuthContext.js';
import { cn } from '../lib/utils.js';

const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Patients', icon: Users, end: false },
  { to: '/appointments', label: 'Rendez-vous', icon: Calendar, end: false },
] as const;

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="flex flex-col border-b border-slate-200 bg-white lg:min-h-screen lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-slate-900">
                ClinicFlow
              </span>
              <span className="block text-xs text-slate-500">Gestion clinique</span>
            </div>
          </div>
        </div>

        <nav aria-label="Navigation principale" className="flex gap-1 px-3 pb-3 lg:flex-1 lg:flex-col lg:py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-teal-50 text-teal-800 shadow-xs ring-1 ring-teal-600/15'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {user ? (
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  user.role === 'admin'
                    ? 'bg-purple-50 text-purple-800 ring-1 ring-purple-600/20'
                    : 'bg-sky-50 text-sky-800 ring-1 ring-sky-600/20',
                )}
              >
                {user.role === 'admin' ? (
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                ) : null}
                {user.role}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Se déconnecter
            </button>
          </div>
        ) : null}
      </aside>

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
