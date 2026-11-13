import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  patientSchema,
  type Patient,
  type PatientFormValues,
  type PatientInput,
} from '@clinicflow/shared';
import { useCreatePatient, useUpdatePatient } from '../api/hooks.js';
import { getErrorMessage } from '../lib/utils.js';
import { Dialog } from './ui/Dialog.js';

interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

export function PatientFormDialog({ open, onClose, patient }: PatientFormDialogProps) {
  const isEdit = Boolean(patient);
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues, unknown, PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: '',
      cin: '',
      phone: '',
      birthDate: '',
      address: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (patient) {
      reset({
        fullName: patient.fullName,
        cin: patient.cin,
        phone: patient.phone,
        birthDate: patient.birthDate,
        address: patient.address ?? '',
      });
    } else {
      reset({
        fullName: '',
        cin: '',
        phone: '',
        birthDate: '',
        address: '',
      });
    }
  }, [open, patient, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (patient) {
        await updateMutation.mutateAsync({ id: patient.id, input: values });
        toast.success('Patient mis à jour avec succès');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Patient créé avec succès');
      }
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Impossible d’enregistrer le patient'));
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier le patient' : 'Nouveau patient'}
      description={
        isEdit
          ? 'Mettez à jour les coordonnées du patient.'
          : 'Renseignez les informations du dossier patient.'
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="patient-fullName" className="block text-sm font-medium text-slate-700">
            Nom complet <span className="text-rose-600">*</span>
          </label>
          <input
            id="patient-fullName"
            type="text"
            required
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'patient-fullName-err' : undefined}
            placeholder="Ex. Mohamed Alaoui"
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
            {...register('fullName')}
          />
          {errors.fullName ? (
            <p id="patient-fullName-err" className="mt-1 text-xs text-rose-600">
              {errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="patient-cin" className="block text-sm font-medium text-slate-700">
              N° CIN <span className="text-rose-600">*</span>
            </label>
            <input
              id="patient-cin"
              type="text"
              required
              aria-invalid={Boolean(errors.cin)}
              aria-describedby={errors.cin ? 'patient-cin-err' : 'patient-cin-help'}
              placeholder="Ex. AB123456"
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm uppercase text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
              {...register('cin')}
            />
            {errors.cin ? (
              <p id="patient-cin-err" className="mt-1 text-xs text-rose-600">
                {errors.cin.message}
              </p>
            ) : (
              <p id="patient-cin-help" className="mt-1 text-xs text-slate-500">
                4 à 20 lettres ou chiffres (unique)
              </p>
            )}
          </div>

          <div>
            <label htmlFor="patient-birthDate" className="block text-sm font-medium text-slate-700">
              Date de naissance <span className="text-rose-600">*</span>
            </label>
            <input
              id="patient-birthDate"
              type="date"
              required
              aria-invalid={Boolean(errors.birthDate)}
              aria-describedby={errors.birthDate ? 'patient-birthDate-err' : undefined}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
              {...register('birthDate')}
            />
            {errors.birthDate ? (
              <p id="patient-birthDate-err" className="mt-1 text-xs text-rose-600">
                {errors.birthDate.message}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="patient-phone" className="block text-sm font-medium text-slate-700">
            Téléphone <span className="text-rose-600">*</span>
          </label>
          <input
            id="patient-phone"
            type="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'patient-phone-err' : undefined}
            placeholder="Ex. +212 661 234 567"
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
            {...register('phone')}
          />
          {errors.phone ? (
            <p id="patient-phone-err" className="mt-1 text-xs text-rose-600">
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="patient-address" className="block text-sm font-medium text-slate-700">
            Adresse <span className="text-xs font-normal text-slate-400">(optionnel)</span>
          </label>
          <textarea
            id="patient-address"
            rows={2}
            aria-invalid={Boolean(errors.address)}
            placeholder="Ex. 12 Rue Ibn Sina, Rabat"
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
            {...register('address')}
          />
          {errors.address ? (
            <p className="mt-1 text-xs text-rose-600">{errors.address.message}</p>
          ) : null}
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
            disabled={isSubmitting}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700 disabled:opacity-60"
          >
            {isSubmitting
              ? 'Enregistrement…'
              : isEdit
                ? 'Enregistrer les modifications'
                : 'Créer le patient'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
