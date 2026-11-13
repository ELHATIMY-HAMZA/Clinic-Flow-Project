import { z } from 'zod';
import { emptyToNull, emptyToUndefined, paginationQuerySchema } from './common.js';

const todayIso = () => new Date().toISOString().slice(0, 10);

export const patientSchema = z.object({
  fullName: z
    .string({ message: 'Nom complet requis' })
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(150, 'Le nom ne doit pas dépasser 150 caractères'),
  cin: z
    .string({ message: 'CIN requis' })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{4,20}$/, 'CIN invalide (4 à 20 lettres/chiffres, sans espace)'),
  phone: z
    .string({ message: 'Téléphone requis' })
    .trim()
    .regex(/^\+?[0-9][0-9 .-]{7,19}$/, 'Numéro de téléphone invalide'),
  birthDate: z
    .iso.date({ message: 'Date de naissance invalide (AAAA-MM-JJ)' })
    .refine((d) => d >= '1900-01-01', 'Date de naissance trop ancienne')
    .refine((d) => d <= todayIso(), 'La date de naissance ne peut pas être dans le futur'),
  address: z.preprocess(emptyToNull, z.string().trim().max(500).nullable()),
});
export type PatientInput = z.infer<typeof patientSchema>;
/** Form-side (pre-transform) shape, useful for react-hook-form. */
export type PatientFormValues = z.input<typeof patientSchema>;

export const listPatientsQuerySchema = paginationQuerySchema.extend({
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
});
export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;
