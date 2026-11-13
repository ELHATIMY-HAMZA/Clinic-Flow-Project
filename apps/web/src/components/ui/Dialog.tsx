import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Accessible modal dialog built on the native HTML `<dialog>` element (`showModal()`).
 * Styled according to `design-taste-frontend` (20px radius, 1px hairline border,
 * warm near-black ink, 24px+ padding).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      className={cn(
        'm-auto max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-[20px] border border-[#0F172A]/[0.12] bg-white p-0 text-[#0F172A] shadow-2xl sm:w-full',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#0F172A]/[0.08] px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id={titleId} className="text-[18px] font-semibold tracking-tight text-[#0F172A]">
            {title}
          </h2>
          {description ? (
            <p id={descId} className="mt-1 text-[13px] leading-relaxed text-[#475569]">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la boîte de dialogue"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#475569] transition hover:bg-[#F4F7FB] hover:text-[#0F172A]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </dialog>
  );
}
