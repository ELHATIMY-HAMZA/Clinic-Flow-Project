import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[#0c0f12]/[0.07]', className)}
      {...props}
    />
  );
}
