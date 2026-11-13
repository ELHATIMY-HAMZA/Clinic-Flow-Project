import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { AppointmentStatus, Patient } from '@clinicflow/shared';
import { useCreateAppointment, usePatientsList } from '../api/hooks.js';
import { getErrorMessage, toDateTimeLocalValue } from '../lib/utils.js';
import { Dialog } from './ui/Dialog.js';

interface AppointmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  defaultPatient?: Patient | null;
}

export function AppointmentFormDialog({
  open,
  onClose,
  defaultPatient,
}: AppointmentFormDialogProps) {
  const [patientId, setPatientId] = useState<string>(defaultPatient?.id ?? '');
  const [dateTimeLocal, setDateTimeLocal] = useState<string>(() => toDateTimeLocalValue());
  const [status, setStatus] = useState<AppointmentStatus>('pending');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const patientsQuery = usePatientsList({ page: 1, limit: 100 });
  const createMutation = useCreateAppointment();

  useEffect(() => {
    if (!open) return;
    setPatientId(defaultPatient?.id ?? '');
    const nextHour = new Date();
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);
    setDateTimeLocal(toDateTimeLocalValue(nextHour));
    setStatus('pending');
    setReason('');
    setNotes('');
    setFormError(null);
  }, [open, defaultPatient]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!patientId) {
      setFormError('Veuillez sélectionner un patient.');
      return;
    }
    if (!dateTimeLocal) {
      setFormError('Veuillez renseigner la date et l’heure du rendez-vous.');
      return;
    }
    if (reason.trim().length < 2) {
      setFormError('Le motif doit contenir au moins 2 caractères.');
      return;
    }

    const parsedDate = new Date(dateTimeLocal);
    if (Number.isNaN(parsedDate.getTime())) {
      setFormError('Date ou heure invalide.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        patientId,
        appointmentDate: parsedDate.toISOString(),
        status,
        reason: reason.trim(),
        notes: notes.trim() ? notes.trim() : null,
      });
      toast.success('Rendez-vous planifié avec succès');
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, 'Impossible de créer le rendez-vous');
      setFormError(msg);
      toast.error(msg);
    }
  }

  const patients = patientsQuery.data?.data ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nouveau rendez-vous"
      description="Planifiez un rendez-vous pour un patient. Deux rendez-vous confirmés d’un même patient doivent être espacés d’au moins 30 minutes."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800"
          >
            {formError}
          </div>
        ) : null}

        <div>
          <label htmlFor="appt-patient" className="block text-sm font-medium text-slate-700">
            Patient <span className="text-rose-600">*</span>
          </label>
          {defaultPatient ? (
            <input
              id="appt-patient"
              type="text"
              disabled
              value={`${defaultPatient.fullName} (${defaultPatient.cin})`}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm text-slate-700"
            />
          ) : (
            <select
              id="appt-patient"
              name="patientId"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
            >
              <option value="">Sélectionner un patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — {p.cin}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="appt-datetime" className="block text-sm font-medium text-slate-700">
              Date et heure <span className="text-rose-600">*</span>
            </label>
            <input
              id="appt-datetime"
              name="appointmentDate"
              type="datetime-local"
              required
              value={dateTimeLocal}
              onChange={(e) => setDateTimeLocal(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="appt-status" className="block text-sm font-medium text-slate-700">
              Statut initial
            </label>
            <select
              id="appt-status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
            >
              <option value="pending">En attente (pending)</option>
              <option value="confirmed">Confirmé (confirmed)</option>
              <option value="cancelled">Annulé (cancelled)</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="appt-reason" className="block text-sm font-medium text-slate-700">
            Motif de consultation <span className="text-rose-600">*</span>
          </label>
          <input
            id="appt-reason"
            name="reason"
            type="text"
            required
            placeholder="Ex. Consultation générale, contrôle annuel…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="appt-notes" className="block text-sm font-medium text-slate-700">
            Notes <span className="text-xs font-normal text-slate-400">(optionnel)</span>
          </label>
          <textarea
            id="appt-notes"
            name="notes"
            rows={2}
            placeholder="Observations ou instructions particulières…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700 disabled:opacity-60"
          >
            {createMutation.isPending ? 'Création…' : 'Planifier le rendez-vous'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
