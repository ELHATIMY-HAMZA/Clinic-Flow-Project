import { Calendar, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import type { AppointmentStatus } from '@clinicflow/shared';
import { useAppointmentsList, useUpdateAppointmentStatus } from '../api/hooks.js';
import { AnimatedTabs } from '../components/aceternity/AnimatedTabs.js';
import { AppointmentFormDialog } from '../components/AppointmentFormDialog.js';
import { BorderGlow } from '../components/reactbits/BorderGlow.js';
import { Button } from '../components/ui/Button.js';
import { Input, Label } from '../components/ui/Input.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table.js';
import { formatDateTimeFr, getErrorMessage } from '../lib/utils.js';

const STATUS_TABS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmés' },
  { value: 'cancelled', label: 'Annulés' },
] as const;

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
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[12px] font-semibold tracking-wider text-[#0284C7] uppercase">
            Agenda des consultations
          </p>
          <h1 className="mt-1 text-[24px] leading-tight font-bold tracking-tight text-[#0F172A] sm:text-[32px]">
            Planning des rendez-vous.{' '}
            <span className="font-normal text-[#475569]">
              Filtrez l’agenda par date ou statut et confirmez les créneaux.
            </span>
          </h1>
        </div>
        <Button
          type="button"
          onClick={() => setCreateOpen(true)}
          withArrow
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouveau rendez-vous
        </Button>
      </header>

      {/* Filters bar */}
      <search>
        <BorderGlow className="p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="space-y-1.5">
              <span className="block text-[13px] font-medium text-[#0F172A]">
                Statut de la consultation
              </span>
              <AnimatedTabs
                items={STATUS_TABS}
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                layoutId="appointments-status-filter"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full sm:w-52">
                <Label htmlFor="filter-date">Filtrer par date</Label>
                <div className="relative mt-1.5">
                  <Calendar
                    className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-[#64748B]"
                    aria-hidden="true"
                  />
                  <Input
                    id="filter-date"
                    name="date"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 pl-10 text-[13px]"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={resetFilters}
                disabled={!dateFilter && !statusFilter}
                className="min-h-[44px]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </BorderGlow>
      </search>

      {/* Appointments List / Table */}
      <BorderGlow className="overflow-hidden p-0">
        {appointmentsQuery.isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-[15px] text-[#475569]">
            Aucun rendez-vous trouvé pour les filtres sélectionnés.
          </div>
        ) : (
          <>
            {/* Mobile Card List (< 768px) */}
            <div className="divide-y divide-[#0F172A]/[0.07] md:hidden">
              {appointments.map((appt) => (
                <article key={appt.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/patients/${appt.patientId}`}
                        className="text-[16px] font-semibold text-[#0F172A] underline decoration-[#0F172A]/25 underline-offset-4 hover:text-[#0284C7]"
                      >
                        {appt.patientFullName}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#F4F7FB] px-1.5 py-0.5 font-mono text-[11px] text-[#475569]">
                          {appt.patientCin}
                        </span>
                        <span className="font-mono text-[12px] font-medium text-[#0F172A]">
                          {formatDateTimeFr(appt.appointmentDate)}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  <div>
                    <p className="text-[14px] font-medium text-[#0F172A]">{appt.reason}</p>
                    {appt.notes ? (
                      <p className="mt-0.5 text-[13px] text-[#475569]">{appt.notes}</p>
                    ) : null}
                    {appt.createdByName ? (
                      <p className="mt-1 text-[11px] text-[#64748B]">
                        Enregistré par : <span className="font-medium">{appt.createdByName}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[12px] font-medium text-[#475569]">
                      Statut du rendez-vous :
                    </span>
                    <select
                      name={`mobile-status-${appt.id}`}
                      aria-label={`Statut du rendez-vous de ${appt.patientFullName}`}
                      value={appt.status}
                      onChange={(e) =>
                        void handleStatusChange(appt.id, e.target.value as AppointmentStatus)
                      }
                      className="min-h-[44px] rounded-xl border border-[#0F172A]/[0.14] bg-white px-3 text-[13px] font-medium text-[#0F172A] focus:border-[#0284C7] focus:outline-none"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop Table (>= 768px) */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date &amp; heure</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Enregistré par</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Modifier le statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-mono text-[13px] font-medium whitespace-nowrap">
                        {formatDateTimeFr(appt.appointmentDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Link
                          to={`/patients/${appt.patientId}`}
                          className="font-semibold text-[#0F172A] decoration-[#0F172A]/25 underline-offset-4 hover:text-[#0284C7] hover:underline"
                        >
                          {appt.patientFullName}
                        </Link>
                        <span className="ml-2 rounded-md bg-[#F4F7FB] px-1.5 py-0.5 font-mono text-[11px] text-[#475569]">
                          {appt.patientCin}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-[#0F172A]">{appt.reason}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-[#475569]">
                        {appt.notes ?? '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-[13px] text-[#475569]">
                        {appt.createdByName ?? '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={appt.status} />
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <select
                          name={`status-${appt.id}`}
                          aria-label={`Statut du rendez-vous de ${appt.patientFullName}`}
                          value={appt.status}
                          onChange={(e) =>
                            void handleStatusChange(appt.id, e.target.value as AppointmentStatus)
                          }
                          className="h-9 rounded-lg border border-[#0F172A]/[0.14] bg-white px-2.5 text-[12px] font-medium text-[#0F172A] focus:border-[#0284C7] focus:outline-none"
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
      </BorderGlow>

      <AppointmentFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
