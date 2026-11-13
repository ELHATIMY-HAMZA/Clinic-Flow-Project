import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@clinicflow/shared';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError.js';

/**
 * Restricts access to users whose role is in `allowedRoles`.
 * Must be placed after `authenticate`.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentification requise');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Accès réservé aux administrateurs');
    }
    next();
  };
}
