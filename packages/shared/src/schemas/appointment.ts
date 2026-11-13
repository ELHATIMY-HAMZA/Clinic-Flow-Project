import { z } from 'zod';
import { APPOINTMENT_STATUSES } from '../constants.js';
import { emptyToNull, emptyToUndefined, paginationQuerySchema } from './common.js';

export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUSES, {
  message: 'Statut invalide (pending, confirmed ou cancelled)',
});

export const createAppointmentSchema = z.object({
  patientId: z.uuid({ message: 'Patient invalide' }),
  appointmentDate: z.iso.datetime({ offset: true, message: 'Date/heure invalide (ISO 8601)' }),
  status: appointmentStatusSchema.default('pending'),
  reason: z
    .string({ message: 'Motif requis' })
    .trim()
    .min(2, 'Le motif doit contenir au moins 2 caractères')
    .max(255, 'Le motif ne doit pas dépasser 255 caractères'),
  notes: z.preprocess(emptyToNull, z.string().trim().max(2000).nullable()),
});
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusSchema,
});
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

export const listAppointmentsQuerySchema = paginationQuerySchema.extend({
  date: z.preprocess(emptyToUndefined, z.iso.date({ message: 'Date invalide (AAAA-MM-JJ)' }).optional()),
  status: z.preprocess(emptyToUndefined, appointmentStatusSchema.optional()),
  patientId: z.preprocess(emptyToUndefined, z.uuid({ message: 'Patient invalide' }).optional()),
});
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
