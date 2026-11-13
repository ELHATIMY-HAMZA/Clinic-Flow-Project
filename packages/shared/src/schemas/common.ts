import { z } from 'zod';
import { PAGINATION } from '../constants.js';

/** Query-string pagination (`?page=&limit=`), coerced from strings. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.maxLimit).default(PAGINATION.defaultLimit),
});

export const uuidParamSchema = z.object({
  id: z.uuid({ message: 'Identifiant invalide' }),
});

/** Turns '' into undefined so optional query params / inputs behave intuitively. */
export const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

/** Turns '' / undefined into null for nullable DB columns. */
export const emptyToNull = (v: unknown) =>
  v === undefined || (typeof v === 'string' && v.trim() === '') ? null : v;
