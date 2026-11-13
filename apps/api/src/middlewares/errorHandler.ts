import type { NextFunction, Request, Response } from 'express';
import type { ApiErrorBody } from '@clinicflow/shared';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { mapPgError } from '../utils/pgErrors.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  // Malformed JSON body from express.json()
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as { status?: number }).status === 400 &&
    'body' in err
  ) {
    const body: ApiErrorBody = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Corps JSON invalide',
      },
    };
    res.status(400).json(body);
    return;
  }

  const operational = err instanceof AppError ? err : mapPgError(err);
  if (operational) {
    const body: ApiErrorBody = {
      error: {
        code: operational.code,
        message: operational.message,
        ...(operational.details ? { details: operational.details } : {}),
      },
    };
    res.status(operational.statusCode).json(body);
    return;
  }

  logger.error({ err, method: req.method, url: req.originalUrl }, 'Unhandled server error');
  const body: ApiErrorBody = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erreur interne du serveur',
    },
  };
  res.status(500).json(body);
}
