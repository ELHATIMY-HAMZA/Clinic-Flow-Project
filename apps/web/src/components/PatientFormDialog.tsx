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
import { Button } from './ui/Button.js';
import { Dialog } from './ui/Dialog.js';
import { Input, Label } from './ui/Input.js';

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
      title={isEdit ? 'Modifier le dossier patient' : 'Nouveau dossier patient'}
      description={
        isEdit
          ? 'Mettez à jour les coordonnées administratives du patient.'
          : 'Renseignez les informations obligatoires du patient.'
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="patient-fullName">
            Nom complet <span className="text-rose-600">*</span>
          </Label>
          <Input
            id="patient-fullName"
            type="text"
            required
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'patient-fullName-err' : undefined}
            placeholder="Ex. Mohamed Alaoui"
            className="mt-1.5"
            {...register('fullName')}
          />
          {errors.fullName ? (
            <p id="patient-fullName-err" className="mt-1.5 text-[13px] text-rose-600">
              {errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="patient-cin">
              N° CIN <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="patient-cin"
              type="text"
              required
              aria-invalid={Boolean(errors.cin)}
              aria-describedby={errors.cin ? 'patient-cin-err' : 'patient-cin-help'}
              placeholder="Ex. AB123456"
              className="mt-1.5 font-mono uppercase"
              {...register('cin')}
            />
            {errors.cin ? (
              <p id="patient-cin-err" className="mt-1.5 text-[13px] text-rose-600">
                {errors.cin.message}
              </p>
            ) : (
              <p id="patient-cin-help" className="mt-1.5 text-[13px] text-[#5a626a]">
                4 à 20 lettres ou chiffres (unique)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="patient-birthDate">
              Date de naissance <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="patient-birthDate"
              type="date"
              required
              aria-invalid={Boolean(errors.birthDate)}
              aria-describedby={errors.birthDate ? 'patient-birthDate-err' : undefined}
              className="mt-1.5"
              {...register('birthDate')}
            />
            {errors.birthDate ? (
              <p id="patient-birthDate-err" className="mt-1.5 text-[13px] text-rose-600">
                {errors.birthDate.message}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="patient-phone">
            Téléphone <span className="text-rose-600">*</span>
          </Label>
          <Input
            id="patient-phone"
            type="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'patient-phone-err' : undefined}
            placeholder="Ex. +212 661 234 567"
            className="mt-1.5"
            {...register('phone')}
          />
          {errors.phone ? (
            <p id="patient-phone-err" className="mt-1.5 text-[13px] text-rose-600">
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="patient-address">
            Adresse <span className="font-normal text-[#5a626a]">(optionnel)</span>
          </Label>
            <textarea
              id="patient-address"
              rows={2}
              aria-invalid={Boolean(errors.address)}
              placeholder="Ex. Rue Ibn Sina, Quartier Agdal"
              className="mt-1.5 block w-full rounded-[10px] border border-[#0F172A]/[0.14] bg-white px-3.5 py-2 text-[14px] text-[#0F172A] transition-[border-color,box-shadow] duration-140 placeholder:text-[#64748B]/70 focus:border-[#0284C7] focus:ring-3 focus:ring-[#0284C7]/15 focus:outline-none"
              {...register('address')}
            />
            {errors.address ? (
              <p className="mt-1.5 text-[13px] text-rose-600">{errors.address.message}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-[#0F172A]/[0.08] pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting} withArrow>
            {isSubmitting
              ? 'Enregistrement…'
              : isEdit
                ? 'Enregistrer les modifications'
                : 'Créer le patient'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
