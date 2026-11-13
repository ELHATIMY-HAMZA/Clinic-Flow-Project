import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { AppointmentStatus, Patient } from '@clinicflow/shared';
import { useCreateAppointment, usePatientsList } from '../api/hooks.js';
import { getErrorMessage, toDateTimeLocalValue } from '../lib/utils.js';
import { Button } from './ui/Button.js';
import { Dialog } from './ui/Dialog.js';
import { Input, Label } from './ui/Input.js';

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
      title="Planifier un rendez-vous"
      description="Deux rendez-vous confirmés d’un même patient doivent être espacés d’au moins 30 minutes."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError ? (
          <div
            role="alert"
            className="rounded-[10px] border border-rose-500/25 bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-800"
          >
            {formError}
          </div>
        ) : null}

        <div>
          <Label htmlFor="appt-patient">
            Patient <span className="text-rose-600">*</span>
          </Label>
          {defaultPatient ? (
            <Input
              id="appt-patient"
              type="text"
              disabled
              value={`${defaultPatient.fullName} (${defaultPatient.cin})`}
              className="mt-1.5"
            />
          ) : (
            <select
              id="appt-patient"
              name="patientId"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="mt-1.5 flex h-11 w-full rounded-[10px] border border-[#0F172A]/[0.14] bg-white px-3.5 py-2 text-[14px] text-[#0F172A] focus:border-[#0284C7] focus:ring-3 focus:ring-[#0284C7]/15 focus:outline-none"
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
            <Label htmlFor="appt-datetime">
              Date et heure <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="appt-datetime"
              name="appointmentDate"
              type="datetime-local"
              required
              value={dateTimeLocal}
              onChange={(e) => setDateTimeLocal(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="appt-status">Statut du rendez-vous</Label>
            <select
              id="appt-status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="mt-1.5 flex h-11 w-full rounded-[10px] border border-[#0F172A]/[0.14] bg-white px-3.5 py-2 text-[14px] text-[#0F172A] focus:border-[#0284C7] focus:ring-3 focus:ring-[#0284C7]/15 focus:outline-none"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="appt-reason">
            Motif de consultation <span className="text-rose-600">*</span>
          </Label>
          <Input
            id="appt-reason"
            name="reason"
            type="text"
            required
            placeholder="Ex. Consultation générale, suivi tension…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="appt-notes">
            Notes <span className="font-normal text-[#64748B]">(optionnel)</span>
          </Label>
          <textarea
            id="appt-notes"
            name="notes"
            rows={2}
            placeholder="Observations ou instructions particulières…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5 block w-full rounded-[10px] border border-[#0F172A]/[0.14] bg-white px-3.5 py-2 text-[14px] text-[#0F172A] transition-[border-color,box-shadow] duration-140 placeholder:text-[#64748B]/70 focus:border-[#0284C7] focus:ring-3 focus:ring-[#0284C7]/15 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-[#0F172A]/[0.08] pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending} withArrow>
            {createMutation.isPending ? 'Planification…' : 'Planifier le rendez-vous'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
