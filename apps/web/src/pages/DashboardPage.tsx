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
import {
  BentoGrid,
  BentoGridItem,
  ClinicalPulseDiagram,
} from '../components/aceternity/BentoGrid.js';
import { AppointmentFormDialog } from '../components/AppointmentFormDialog.js';
import { BorderGlow } from '../components/reactbits/BorderGlow.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
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
  const todayAppointments = todayApptsQuery.data?.data ?? [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header following taste-skill two-part sentence hierarchy */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[12px] font-medium tracking-wide text-[#0d9488] uppercase">
            Vue d’ensemble · {todayIso}
          </p>
          <h1 className="mt-1 text-[24px] leading-tight font-bold tracking-tight text-[#0c0f12] sm:text-[32px]">
            Tableau de bord clinique.{' '}
            <span className="font-normal text-[#5a626a]">
              Activité du jour et suivi des créneaux.
            </span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button type="button" variant="secondary" asChild className="flex-1 sm:flex-none">
            <Link to="/patients">Voir les patients</Link>
          </Button>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            withArrow
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Planifier un rendez-vous
          </Button>
        </div>
      </header>

      {/* Aceternity BentoGrid + ReactBits BorderGlow Stat Cards */}
      <BentoGrid>
        <BentoGridItem
          index={0}
          className="lg:col-span-3"
          title="Total patients"
          value={statsQuery.isLoading ? '—' : (stats?.totalPatients ?? 0)}
          description="Dossiers patients actifs enregistrés dans la clinique"
          icon={<Users className="h-5 w-5 text-[#0d9488]" aria-hidden="true" />}
          glowColor="rgba(13, 148, 136, 0.78)"
        />
        <BentoGridItem
          index={1}
          className="lg:col-span-3"
          title="Rendez-vous du jour"
          value={statsQuery.isLoading ? '—' : (stats?.todayAppointments ?? 0)}
          description="Consultations programmées sur la journée en cours"
          icon={<CalendarClock className="h-5 w-5 text-[#0c0f12]" aria-hidden="true" />}
          glowColor="rgba(12, 15, 18, 0.55)"
        />
        <BentoGridItem
          index={2}
          className="lg:col-span-3"
          title="En attente (pending)"
          value={statsQuery.isLoading ? '—' : (stats?.pendingAppointments ?? 0)}
          description="Rendez-vous en attente de validation par l’équipe"
          icon={<Clock className="h-5 w-5 text-amber-600" aria-hidden="true" />}
          glowColor="rgba(245, 158, 11, 0.75)"
        />
        <BentoGridItem
          index={3}
          className="lg:col-span-3"
          title="Confirmés (confirmed)"
          value={statsQuery.isLoading ? '—' : (stats?.confirmedAppointments ?? 0)}
          description="Créneaux validés (protégés par la fenêtre de 30 minutes)"
          icon={<CalendarCheck2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />}
          glowColor="rgba(16, 185, 129, 0.75)"
        />
      </BentoGrid>

      {/* Live Workflow Visual Banner + Today's Appointments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <BorderGlow
          className="flex flex-col justify-between p-5 sm:p-6"
          containerClassName="lg:col-span-4"
        >
          <div className="space-y-2">
            <Badge variant="teal">Règle métier garantie</Badge>
            <h2 className="text-[18px] font-semibold tracking-tight text-[#0c0f12]">
              Anti-chevauchement des consultations.{' '}
              <span className="font-normal text-[#5a626a]">
                Vérifié par l’API et PostgreSQL.
              </span>
            </h2>
            <p className="text-[14px] leading-relaxed text-[#5a626a]">
              Un patient ne peut pas avoir deux rendez-vous confirmés dans une fenêtre de 30
              minutes. Les créneaux en attente restent modifiables jusqu’à confirmation.
            </p>
          </div>
          <div className="mt-5">
            <ClinicalPulseDiagram />
          </div>
        </BorderGlow>

        <BorderGlow className="overflow-hidden p-0" containerClassName="lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0c0f12]/[0.08] px-5 py-4 sm:px-6 sm:py-5">
            <div>
              <h2 className="text-[17px] font-semibold tracking-tight text-[#0c0f12] sm:text-[18px]">
                Consultations d’aujourd’hui.{' '}
                <span className="font-normal text-[#5a626a]">
                  {todayAppointments.length} créneau{todayAppointments.length > 1 ? 'x' : ''}
                </span>
              </h2>
            </div>
            <Button variant="secondary" size="sm" asChild withArrow>
              <Link to="/appointments">Planning complet</Link>
            </Button>
          </div>

          {todayApptsQuery.isLoading ? (
            <div className="space-y-3 p-5 sm:p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="p-10 text-center text-[14px] text-[#5a626a]">
              Aucun rendez-vous programmé pour aujourd’hui.
            </div>
          ) : (
            <>
              {/* Mobile Card List (< 768px) — Zero horizontal overflow & 44px+ touch controls */}
              <div className="divide-y divide-[#0c0f12]/[0.08] md:hidden">
                {todayAppointments.map((appt) => (
                  <article key={appt.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/patients/${appt.patientId}`}
                          className="text-[15px] font-semibold text-[#0c0f12] underline decoration-[#0c0f12]/30 underline-offset-4 hover:text-[#0d9488]"
                        >
                          {appt.patientFullName}
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded-md bg-[#f4f4f2] px-1.5 py-0.5 font-mono text-[11px] text-[#5a626a]">
                            {appt.patientCin}
                          </span>
                          <span className="font-mono text-[12px] font-medium text-[#0c0f12]">
                            {formatDateTimeFr(appt.appointmentDate)}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>
                    <p className="text-[13px] text-[#5a626a]">{appt.reason}</p>
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-[12px] font-medium text-[#5a626a]">
                        Modifier le statut :
                      </span>
                      <select
                        name={`mobile-status-${appt.id}`}
                        aria-label={`Statut du rendez-vous de ${appt.patientFullName}`}
                        value={appt.status}
                        onChange={(e) =>
                          void handleStatusChange(appt.id, e.target.value as AppointmentStatus)
                        }
                        className="min-h-[44px] rounded-xl border border-[#0c0f12]/[0.15] bg-white px-3 text-[13px] font-medium text-[#0c0f12] focus:border-[#0d9488] focus:outline-none"
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
                      <TableHead>Horaire</TableHead>
                      <TableHead>Patient &amp; motif</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayAppointments.map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell className="font-mono text-[13px] font-medium whitespace-nowrap">
                          {formatDateTimeFr(appt.appointmentDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/patients/${appt.patientId}`}
                              className="font-semibold text-[#0c0f12] decoration-[#0c0f12]/30 underline-offset-4 hover:text-[#0d9488] hover:underline"
                            >
                              {appt.patientFullName}
                            </Link>
                            <span className="rounded-md bg-[#f4f4f2] px-1.5 py-0.5 font-mono text-[11px] text-[#5a626a]">
                              {appt.patientCin}
                            </span>
                          </div>
                          <p className="mt-0.5 max-w-[260px] truncate text-[12px] text-[#5a626a]">
                            {appt.reason}
                          </p>
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
                            className="h-9 rounded-lg border border-[#0c0f12]/[0.15] bg-white px-2.5 text-[12px] font-medium text-[#0c0f12] focus:border-[#0d9488] focus:outline-none"
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
        </BorderGlow>
      </div>

      <AppointmentFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
