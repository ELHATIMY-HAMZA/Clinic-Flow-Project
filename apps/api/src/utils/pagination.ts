import type { PaginationMeta } from '@clinicflow/shared';

export function toOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Escapes LIKE wildcards so user input is matched literally, then wraps in %…%. */
export function containsPattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export const toIso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : d);
