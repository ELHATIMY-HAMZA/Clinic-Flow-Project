import { CalendarCheck2, CalendarClock, Clock, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import type { AppointmentStatus } from '@clinicflow/shared';
import {
  useAppointmentsList,
  useDashboardStats,
  useUpdateAppointmentStatus,
} from '../api/hooks.js';
import { AppointmentFormDialog } from '../components/AppointmentFormDialog.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { formatDateTimeFr, getErrorMessage } from '../lib/utils.js';

export function DashboardPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const statsQuery = useDashboardStats();
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayApptsQuery = useAppointmentsList({ date: todayIso, page: 1, limit: 10 });
  const updateStatusMutation = useUpdateAppointmentStatus();

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success('Statut du rendez-vous mis à jour');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Impossible de modifier le statut'));
    }
  }

  const stats = statsQuery.data;
  const cards = [
    {
      label: 'Total patients',
      value: stats?.totalPatients ?? '—',
      sub: 'Dossiers enregistrés',
      icon: Users,
      accent: 'bg-sky-50 text-sky-700 ring-sky-600/15',
    },
    {
      label: 'Rendez-vous du jour',
      value: stats?.todayAppointments ?? '—',
      sub: "Planifiés aujourd'hui",
      icon: CalendarClock,
      accent: 'bg-teal-50 text-teal-700 ring-teal-600/15',
    },
    {
      label: 'En attente (pending)',
      value: stats?.pendingAppointments ?? '—',
      sub: 'À confirmer',
      icon: Clock,
      accent: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    },
    {
      label: 'Confirmés (confirmed)',
      value: stats?.confirmedAppointments ?? '—',
      sub: 'Créneaux validés',
      icon: CalendarCheck2,
      accent: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
    },
  ] as const;

  const todayAppointments = todayApptsQuery.data?.data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-slate-600">
            Vue d’ensemble de l’activité de la clinique et des rendez-vous du jour.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouveau rendez-vous
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{label}</span>
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${accent}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Rendez-vous d’aujourd’hui</h2>
            <p className="text-xs text-slate-500">
              Accès rapide aux consultations prévues ce jour
            </p>
          </div>
          <Link
            to="/appointments"
            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            Voir tous les rendez-vous →
          </Link>
        </div>

        {todayApptsQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Chargement des rendez-vous…</div>
        ) : todayAppointments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Aucun rendez-vous programmé pour aujourd’hui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Horaire</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Motif</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Changer le statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {todayAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/75">
                    <td className="px-6 py-3.5 font-medium whitespace-nowrap text-slate-900">
                      {formatDateTimeFr(appt.appointmentDate)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <Link
                        to={`/patients/${appt.patientId}`}
                        className="font-medium text-teal-700 hover:underline"
                      >
                        {appt.patientFullName}
                      </Link>
                      <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                        {appt.patientCin}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{appt.reason}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <select
                        aria-label={`Statut du rendez-vous de ${appt.patientFullName}`}
                        value={appt.status}
                        onChange={(e) =>
                          void handleStatusChange(appt.id, e.target.value as AppointmentStatus)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none"
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AppointmentFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
