import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[12px] font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: 'bg-[#F4F7FB] text-[#0F172A] ring-[#0F172A]/10',
        teal: 'bg-[#E0F2FE] text-[#0369A1] ring-[#0284C7]/25',
        amber: 'bg-amber-500/10 text-amber-900 ring-amber-600/25',
        emerald: 'bg-emerald-500/10 text-emerald-900 ring-emerald-600/25',
        rose: 'bg-rose-500/10 text-rose-900 ring-rose-600/25',
        ink: 'bg-[#0F172A] text-white ring-[#0F172A]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
