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
import { AppointmentFormDialog } from '../components/AppointmentFormDialog.js';
import { PatientFormDialog } from '../components/PatientFormDialog.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';
import { formatDateFr, formatDateTimeFr, getErrorMessage } from '../lib/utils.js';

export function PatientDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [editOpen, setEditOpen] = useState(false);
  const [newApptOpen, setNewApptOpen] = useState(false);

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
    return <div className="p-10 text-center text-sm text-slate-500">Chargement du dossier…</div>;
  }

  const patient = patientQuery.data;
  if (!patient) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-base font-semibold text-slate-900">Patient introuvable</p>
        <Link
          to="/patients"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à la liste des patients
        </Link>
      </div>
    );
  }

  const appointments = apptsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/patients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux patients
        </Link>
      </div>

      {/* Patient info card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{patient.fullName}</h1>
              <span className="rounded-lg bg-teal-50 px-2.5 py-1 font-mono text-xs font-semibold text-teal-800 ring-1 ring-teal-600/20">
                CIN : {patient.cin}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Dossier créé le {formatDateFr(patient.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Modifier la fiche
            </button>
            <button
              type="button"
              onClick={() => setNewApptOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Nouveau rendez-vous
            </button>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Téléphone
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{patient.phone}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <UserCheck className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Date de naissance
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {formatDateFr(patient.birthDate)}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              Adresse
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {patient.address ?? 'Non renseignée'}
            </dd>
          </div>
        </dl>
      </section>

      {/* Patient appointments list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Historique des rendez-vous ({appointments.length})
          </h2>
          <p className="text-xs text-slate-500">
            Tous les rendez-vous associés à {patient.fullName}
          </p>
        </div>

        {apptsQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Chargement des rendez-vous…</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Aucun rendez-vous enregistré pour ce patient.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Date &amp; heure</th>
                  <th className="px-6 py-3">Motif</th>
                  <th className="px-6 py-3">Notes</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Modifier le statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/75">
                    <td className="px-6 py-3.5 font-medium whitespace-nowrap text-slate-900">
                      {formatDateTimeFr(appt.appointmentDate)}
                    </td>
                    <td className="px-6 py-3.5 text-slate-800">{appt.reason}</td>
                    <td className="px-6 py-3.5 text-slate-500">{appt.notes ?? '—'}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <select
                        aria-label={`Statut du rendez-vous du ${formatDateTimeFr(appt.appointmentDate)}`}
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

      <PatientFormDialog open={editOpen} onClose={() => setEditOpen(false)} patient={patient} />
      <AppointmentFormDialog
        open={newApptOpen}
        onClose={() => setNewApptOpen(false)}
        defaultPatient={patient}
      />
    </div>
  );
}
