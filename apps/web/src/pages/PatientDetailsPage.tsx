import { ArrowLeft, CalendarPlus, MapPin, Pencil, Phone, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import type { AppointmentStatus } from '@clinicflow/shared';
import {
  usePatient,
  usePatientAppointments,
  useUpdateAppointmentStatus,
} from '../api/hooks.js';
import { AnimatedTabs } from '../components/aceternity/AnimatedTabs.js';
import { AppointmentFormDialog } from '../components/AppointmentFormDialog.js';
import { PatientFormDialog } from '../components/PatientFormDialog.js';
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
import { formatDateFr, formatDateTimeFr, getErrorMessage } from '../lib/utils.js';

export function PatientDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [editOpen, setEditOpen] = useState(false);
  const [newApptOpen, setNewApptOpen] = useState(false);
  const [statusTab, setStatusTab] = useState<'all' | AppointmentStatus>('all');

  const patientQuery = usePatient(id);
  const apptsQuery = usePatientAppointments(id);
  const updateStatusMutation = useUpdateAppointmentStatus();

  async function handleStatusChange(appointmentId: string, status: AppointmentStatus) {
    try {
      await updateStatusMutation.mutateAsync({ id: appointmentId, status });
      toast.success('Statut du rendez-vous mis à jour');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Impossible de modifier le statut'));
    }
  }

  if (patientQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-48 w-full rounded-[20px]" />
        <Skeleton className="h-64 w-full rounded-[20px]" />
      </div>
    );
  }

  const patient = patientQuery.data;
  if (!patient) {
    return (
      <BorderGlow className="p-10 text-center">
        <p className="text-[18px] font-semibold text-[#0c0f12]">Patient introuvable</p>
        <p className="mt-1 text-[14px] text-[#5a626a]">
          Ce dossier n’existe pas ou a été supprimé.
        </p>
        <Button variant="secondary" asChild className="mt-5">
          <Link to="/patients">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour à la liste des patients
          </Link>
        </Button>
      </BorderGlow>
    );
  }

  const allAppointments = apptsQuery.data ?? [];
  const filteredAppointments =
    statusTab === 'all'
      ? allAppointments
      : allAppointments.filter((a) => a.status === statusTab);

  const tabItems = [
    { value: 'all', label: 'Tous', count: allAppointments.length },
    {
      value: 'pending',
      label: 'En attente',
      count: allAppointments.filter((a) => a.status === 'pending').length,
    },
    {
      value: 'confirmed',
      label: 'Confirmés',
      count: allAppointments.filter((a) => a.status === 'confirmed').length,
    },
    {
      value: 'cancelled',
      label: 'Annulés',
      count: allAppointments.filter((a) => a.status === 'cancelled').length,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/patients">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour aux patients
          </Link>
        </Button>
      </div>

      {/* Patient Info Card wrapped in ReactBits BorderGlow */}
      <BorderGlow className="p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#0c0f12]/[0.08] pb-6 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[26px] font-bold tracking-tight text-[#0c0f12] sm:text-[30px]">
                {patient.fullName}
              </h1>
              <Badge variant="teal" className="font-mono text-[13px]">
                CIN : {patient.cin}
              </Badge>
            </div>
            <p className="mt-1.5 text-[13px] text-[#5a626a]">
              Dossier enregistré le {formatDateFr(patient.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Modifier la fiche
            </Button>
            <Button type="button" onClick={() => setNewApptOpen(true)} withArrow>
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Nouveau rendez-vous
            </Button>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#0c0f12]/[0.08] bg-[#f4f4f2]/70 p-4">
            <dt className="flex items-center gap-1.5 text-[13px] font-medium text-[#5a626a]">
              <Phone className="h-3.5 w-3.5 text-[#0d9488]" aria-hidden="true" />
              Téléphone
            </dt>
            <dd className="mt-1.5 font-mono text-[15px] font-semibold text-[#0c0f12]">
              {patient.phone}
            </dd>
          </div>
          <div className="rounded-xl border border-[#0c0f12]/[0.08] bg-[#f4f4f2]/70 p-4">
            <dt className="flex items-center gap-1.5 text-[13px] font-medium text-[#5a626a]">
              <UserCheck className="h-3.5 w-3.5 text-[#0d9488]" aria-hidden="true" />
              Date de naissance
            </dt>
            <dd className="mt-1.5 text-[15px] font-semibold text-[#0c0f12]">
              {formatDateFr(patient.birthDate)}
            </dd>
          </div>
          <div className="rounded-xl border border-[#0c0f12]/[0.08] bg-[#f4f4f2]/70 p-4">
            <dt className="flex items-center gap-1.5 text-[13px] font-medium text-[#5a626a]">
              <MapPin className="h-3.5 w-3.5 text-[#0d9488]" aria-hidden="true" />
              Adresse
            </dt>
            <dd className="mt-1.5 text-[15px] font-semibold text-[#0c0f12]">
              {patient.address ?? 'Non renseignée'}
            </dd>
          </div>
        </dl>
      </BorderGlow>

      {/* Patient Appointments List */}
      <BorderGlow className="overflow-hidden p-0">
        <div className="flex flex-col justify-between gap-4 border-b border-[#0c0f12]/[0.08] px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight text-[#0c0f12]">
              Historique des rendez-vous.{' '}
              <span className="font-normal text-[#5a626a]">
                {allAppointments.length} consultation{allAppointments.length > 1 ? 's' : ''}
              </span>
            </h2>
          </div>
          <AnimatedTabs
            items={tabItems}
            value={statusTab}
            onChange={setStatusTab}
            layoutId="patient-detail-status-tabs"
          />
        </div>

        {apptsQuery.isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-10 text-center text-[14px] text-[#5a626a]">
            Aucun rendez-vous dans cette catégorie pour ce patient.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date &amp; heure</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Modifier le statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell className="font-mono text-[13px] font-medium whitespace-nowrap">
                    {formatDateTimeFr(appt.appointmentDate)}
                  </TableCell>
                  <TableCell className="font-medium text-[#0c0f12]">{appt.reason}</TableCell>
                  <TableCell className="text-[#5a626a]">{appt.notes ?? '—'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={appt.status} />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <select
                      name={`status-${appt.id}`}
                      aria-label={`Statut du rendez-vous du ${formatDateTimeFr(appt.appointmentDate)}`}
                      value={appt.status}
                      onChange={(e) =>
                        void handleStatusChange(appt.id, e.target.value as AppointmentStatus)
                      }
                      className="h-8 rounded-lg border border-[#0c0f12]/[0.15] bg-white px-2.5 text-[12px] font-medium text-[#0c0f12] focus:border-[#0d9488] focus:outline-none"
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
        )}
      </BorderGlow>

      <PatientFormDialog open={editOpen} onClose={() => setEditOpen(false)} patient={patient} />
      <AppointmentFormDialog
        open={newApptOpen}
        onClose={() => setNewApptOpen(false)}
        defaultPatient={patient}
      />
    </div>
  );
}
