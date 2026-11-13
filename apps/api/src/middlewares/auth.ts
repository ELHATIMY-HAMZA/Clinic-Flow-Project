import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@clinicflow/shared';
import { UnauthorizedError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verifies the `Authorization: Bearer <jwt>` header and populates `req.user`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Jeton d’authentification manquant');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw new UnauthorizedError('Jeton d’authentification manquant');
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new UnauthorizedError('Jeton d’authentification invalide ou expiré');
  }
}
