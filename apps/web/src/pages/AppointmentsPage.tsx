import { Filter, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import type { AppointmentStatus } from '@clinicflow/shared';
import { useAppointmentsList, useUpdateAppointmentStatus } from '../api/hooks.js';
import { AppointmentFormDialog } from '../components/AppointmentFormDialog.js';
import { Pagination } from '../components/ui/Pagination.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { formatDateTimeFr, getErrorMessage } from '../lib/utils.js';

export function AppointmentsPage() {
  const [dateFilter, setDateFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [page, setPage] = useState<number>(1);
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  const appointmentsQuery = useAppointmentsList({
    page,
    limit: 10,
    date: dateFilter || undefined,
    status: statusFilter || undefined,
  });

  const updateStatusMutation = useUpdateAppointmentStatus();

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success('Statut du rendez-vous mis à jour');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Impossible de modifier le statut'));
    }
  }

  function resetFilters() {
    setDateFilter('');
    setStatusFilter('');
    setPage(1);
  }

  const appointments = appointmentsQuery.data?.data ?? [];
  const meta = appointmentsQuery.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rendez-vous</h1>
          <p className="mt-1 text-sm text-slate-600">
            Consultez le planning, filtrez par date ou statut et gérez les confirmations.
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

      {/* Filters */}
      <search className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="filter-date" className="block text-xs font-medium text-slate-600">
              Filtrer par date
            </label>
            <input
              id="filter-date"
              name="date"
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="filter-status" className="block text-xs font-medium text-slate-600">
              Filtrer par statut
            </label>
            <div className="relative mt-1">
              <Filter
                className="pointer-events-none absolute top-2.5 left-3.5 h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
              <select
                id="filter-status"
                name="status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as AppointmentStatus | '');
                  setPage(1);
                }}
                className="block w-full rounded-xl border border-slate-300 bg-white py-2 pr-3.5 pl-10 text-sm text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente (pending)</option>
                <option value="confirmed">Confirmé (confirmed)</option>
                <option value="cancelled">Annulé (cancelled)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!dateFilter && !statusFilter}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Réinitialiser
          </button>
        </div>
      </search>

      {/* Appointments table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        {appointmentsQuery.isLoading ? (
          <div className="p-10 text-center text-sm text-slate-500">Chargement des rendez-vous…</div>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Aucun rendez-vous trouvé pour les filtres sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Date &amp; heure</th>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Motif</th>
                  <th className="px-6 py-3.5">Notes</th>
                  <th className="px-6 py-3.5">Créé par</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5 text-right">Changer le statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/75">
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-slate-900">
                      {formatDateTimeFr(appt.appointmentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/patients/${appt.patientId}`}
                        className="font-semibold text-teal-700 hover:underline"
                      >
                        {appt.patientFullName}
                      </Link>
                      <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                        {appt.patientCin}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800">{appt.reason}</td>
                    <td className="px-6 py-4 text-slate-500">{appt.notes ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {appt.createdByName ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <select
                        aria-label={`Statut du rendez-vous de ${appt.patientFullName}`}
                        value={appt.status}
                        onChange={(e) =>
                          void handleStatusChange(appt.id, e.target.value as AppointmentStatus)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none"
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

        {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
      </div>

      <AppointmentFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
