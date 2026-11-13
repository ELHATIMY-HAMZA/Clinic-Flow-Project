import type { ReactNode } from 'react';
import { CalendarCheck, Clock, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.js';
import { BorderGlow } from '../reactbits/BorderGlow.js';

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  className?: string;
  title: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  icon?: ReactNode;
  header?: ReactNode;
  glowColor?: string;
  index?: number;
}

export function BentoGridItem({
  className,
  title,
  description,
  value,
  icon,
  header,
  glowColor,
  index = 0,
}: BentoGridItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.24),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('h-full', className)}
    >
      <BorderGlow
        glowColor={glowColor}
        interactive
        containerClassName="h-full"
        className="flex h-full flex-col justify-between p-6 lg:p-7"
      >
        {header ? <div className="mb-4">{header}</div> : null}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-[#475569]">{title}</p>
            {value !== undefined ? (
              <p className="font-mono text-[34px] leading-none font-semibold tracking-tight text-[#0F172A]">
                {value}
              </p>
            ) : null}
          </div>
          {icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#0284C7]/15 bg-[#F0F9FF] text-[#0284C7]">
              {icon}
            </div>
          ) : null}
        </div>
        {description ? (
          <div className="mt-4 border-t border-[#0F172A]/[0.06] pt-3 text-[13px] text-[#64748B]">
            {description}
          </div>
        ) : null}
      </BorderGlow>
    </motion.div>
  );
}

/**
 * Simple, user-friendly visual guide showing the 3 steps of clinic appointment management
 * (replaces the developer-oriented database diagram).
 */
export function ClinicalPulseDiagram() {
  const steps = [
    {
      icon: UserCheck,
      title: '1. Fiche patient',
      desc: 'Sélectionnez un patient existant ou créez sa fiche en quelques secondes.',
      tint: 'bg-[#E0F2FE] text-[#0284C7]',
    },
    {
      icon: Clock,
      title: '2. Créneau de 30 min',
      desc: 'Chaque consultation confirmée réserve automatiquement un créneau dédié de 30 minutes.',
      tint: 'bg-amber-500/12 text-amber-700',
    },
    {
      icon: CalendarCheck,
      title: '3. Confirmation',
      desc: 'Validez la présence du patient en un clic depuis votre tableau de bord.',
      tint: 'bg-emerald-500/12 text-emerald-700',
    },
  ] as const;

  return (
    <div className="space-y-2.5 rounded-2xl border border-[#0F172A]/[0.07] bg-[#F4F7FB] p-4">
      {steps.map(({ icon: Icon, title, desc, tint }) => (
        <div
          key={title}
          className="flex items-start gap-3 rounded-xl border border-[#0F172A]/[0.06] bg-white p-3"
        >
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              tint,
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0F172A]">{title}</p>
            <p className="mt-0.5 text-[12px] leading-snug text-[#475569]">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
