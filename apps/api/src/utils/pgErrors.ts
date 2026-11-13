import { type AppError, ConflictError, ValidationError } from './AppError.js';

export const CONFIRMED_CONFLICT_MESSAGE =
  'Ce patient a déjà un rendez-vous confirmé dans une fenêtre de 30 minutes.';

/** Human messages for known constraint names (see db/migrations). */
const UNIQUE_MESSAGES: Record<string, string> = {
  patients_cin_uq: 'Un patient avec ce CIN existe déjà.',
  users_email_lower_uq: 'Un utilisateur avec cet email existe déjà.',
};

interface PgError {
  code: string;
  constraint?: string;
}

function isPgError(err: unknown): err is PgError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string' &&
    // SQLSTATE codes are 5 alphanumeric chars; avoids matching Node errors like ECONNREFUSED
    /^[0-9A-Z]{5}$/.test((err as { code: string }).code) &&
    'severity' in err
  );
}

/**
 * Translates PostgreSQL integrity errors into operational AppErrors.
 * Returns null for anything else (→ 500).
 */
export function mapPgError(err: unknown): AppError | null {
  if (!isPgError(err)) return null;
  switch (err.code) {
    case '23505': // unique_violation
      return new ConflictError(
        (err.constraint && UNIQUE_MESSAGES[err.constraint]) ?? 'Cette ressource existe déjà.',
      );
    case '23P01': // exclusion_violation → business rule (30 min between confirmed appointments)
      return new ConflictError(CONFIRMED_CONFLICT_MESSAGE);
    case '23503': // foreign_key_violation
      return new ValidationError('Référence invalide : la ressource liée est introuvable ou encore utilisée.');
    case '22P02': // invalid_text_representation (e.g. malformed uuid)
    case '22007': // invalid_datetime_format
    case '22008': // datetime_field_overflow
      return new ValidationError('Format de donnée invalide.');
    default:
      return null;
  }
}
