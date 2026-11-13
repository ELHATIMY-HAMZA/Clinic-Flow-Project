import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { AppointmentStatus } from '@clinicflow/shared';
import { cn } from '../../lib/utils.js';

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; classes: string; Icon: typeof Clock }
> = {
  pending: {
    label: 'En attente',
    classes: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    Icon: Clock,
  },
  confirmed: {
    label: 'Confirmé',
    classes: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    Icon: CheckCircle2,
  },
  cancelled: {
    label: 'Annulé',
    classes: 'bg-rose-50 text-rose-800 ring-rose-600/20',
    Icon: XCircle,
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const { label, classes, Icon } = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        classes,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
