import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';
import { ValidationError } from '../utils/AppError.js';

interface ValidationSchemas {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}

function formatZodIssues(issues: z.core.$ZodIssue[]): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join('.') : '_root';
    const list = details[key] ?? [];
    list.push(issue.message);
    details[key] = list;
  }
  return details;
}

/**
 * Validates `req.body`, `req.query`, and/or `req.params` with Zod schemas and
 * replaces them with the parsed/coerced values.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.params) {
      const parsed = schemas.params.safeParse(req.params);
      if (!parsed.success) {
        const details = formatZodIssues(parsed.error.issues);
        const firstMsg = parsed.error.issues[0]?.message ?? 'Paramètres invalides';
        throw new ValidationError(firstMsg, details);
      }
      Object.defineProperty(req, 'params', {
        value: parsed.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    if (schemas.query) {
      const parsed = schemas.query.safeParse(req.query);
      if (!parsed.success) {
        const details = formatZodIssues(parsed.error.issues);
        const firstMsg = parsed.error.issues[0]?.message ?? 'Paramètres de requête invalides';
        throw new ValidationError(firstMsg, details);
      }
      // Express 5 defines `req.query` as a getter on IncomingMessage.prototype;
      // shadow it on the instance with the coerced/validated object.
      Object.defineProperty(req, 'query', {
        value: parsed.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    if (schemas.body) {
      const parsed = schemas.body.safeParse(req.body ?? {});
      if (!parsed.success) {
        const details = formatZodIssues(parsed.error.issues);
        const firstMsg = parsed.error.issues[0]?.message ?? 'Données invalides';
        throw new ValidationError(firstMsg, details);
      }
      req.body = parsed.data;
    }

    next();
  };
}
