import type { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../utils/AppError.js';

export function notFoundHandler(req: Request, _res: Response, _next: NextFunction): void {
  throw new NotFoundError(`Route introuvable : ${req.method} ${req.originalUrl}`);
}
