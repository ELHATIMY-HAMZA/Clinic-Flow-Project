import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.js';

export interface AnimatedTabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface AnimatedTabsProps<T extends string> {
  items: readonly AnimatedTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Aceternity UI `<AnimatedTabs>` (https://ui.aceternity.com/components/tabs)
 * Uses a single ink pill indicator that travels across tabs via `motion.div` (`layoutId`),
 * matching taste-skill/references/motion.md ("one indicator slides to the clicked tab by transform alone:
 * the ink pill, its label in the ground colour; 240ms").
 */
export function AnimatedTabs<T extends string>({
  items,
  value,
  onChange,
  layoutId = 'clinicflow-active-tab',
  className,
  ariaLabel = 'Filtres de statut',
}: AnimatedTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#0F172A]/[0.09] bg-[#F4F7FB] p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7] sm:min-h-[36px] sm:px-3.5',
              active ? 'text-white' : 'text-[#475569] hover:text-[#0F172A]',
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', bounce: 0, duration: 0.26 }}
                className="absolute inset-0 rounded-lg bg-[#0284C7] shadow-xs"
                aria-hidden="true"
              />
            ) : null}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {item.icon}
              <span>{item.label}</span>
              {item.count !== undefined ? (
                <span
                  className={cn(
                    'rounded-md px-1.5 py-0.5 font-mono text-[11px]',
                    active ? 'bg-white/20 text-white' : 'bg-[#0F172A]/[0.06] text-[#0F172A]',
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
