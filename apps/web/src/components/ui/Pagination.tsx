import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@clinicflow/shared';
import { Button } from './Button.js';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#0F172A]/[0.08] bg-[#F4F7FB]/60 px-5 py-3.5 sm:flex-row">
      <p className="text-[13px] text-[#475569]">
        Affichage de <span className="font-mono font-semibold text-[#0F172A]">{from}</span> à{' '}
        <span className="font-mono font-semibold text-[#0F172A]">{to}</span> sur{' '}
        <span className="font-mono font-semibold text-[#0F172A]">{total}</span> résultat
        {total > 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Précédent
        </Button>
        <span className="px-2.5 font-mono text-[13px] font-medium text-[#0F172A]">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Suivant
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
