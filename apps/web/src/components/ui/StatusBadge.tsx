import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { AppointmentStatus } from '@clinicflow/shared';
import { Badge, type BadgeProps } from './Badge.js';

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; variant: BadgeProps['variant']; Icon: typeof Clock }
> = {
  pending: {
    label: 'En attente',
    variant: 'amber',
    Icon: Clock,
  },
  confirmed: {
    label: 'Confirmé',
    variant: 'emerald',
    Icon: CheckCircle2,
  },
  cancelled: {
    label: 'Annulé',
    variant: 'rose',
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
  const { label, variant, Icon } = STATUS_META[status];
  return (
    <Badge variant={variant} className={className}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
}
