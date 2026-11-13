import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@clinicflow/shared';
import { env } from '../config/env.js';

export interface JwtPayload {
  sub: string; // user id
  role: UserRole;
}

const ALGORITHM = 'HS256';

export function signToken(payload: JwtPayload): string {
  return jwt.sign({ role: payload.role }, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    subject: payload.sub,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

/** Throws if the token is invalid/expired. Algorithm is pinned to prevent alg-confusion attacks. */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new Error('Malformed token payload');
  }
  return { sub: decoded.sub, role: decoded.role as UserRole };
}
