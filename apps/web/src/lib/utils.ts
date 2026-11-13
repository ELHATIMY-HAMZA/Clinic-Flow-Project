import axios from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';
import type { ApiErrorBody } from '@clinicflow/shared';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDateFr(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'dd MMM yyyy', { locale: fr });
  } catch {
    return isoDate;
  }
}

export function formatDateTimeFr(isoDateTime: string): string {
  try {
    return format(parseISO(isoDateTime), "dd MMM yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return isoDateTime;
  }
}

/** Formats a Date into `YYYY-MM-DDTHH:mm` in local time for `<input type="datetime-local">`. */
export function toDateTimeLocalValue(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

/** Extracts a user-facing French error message from an Axios/API error. */
export function getErrorMessage(
  err: unknown,
  fallback = 'Une erreur inattendue est survenue.',
): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    const apiMessage = err.response?.data?.error?.message;
    if (apiMessage) return apiMessage;
    if (err.code === 'ERR_NETWORK') {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
