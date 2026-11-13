import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.js';
import { BorderGlow } from '../reactbits/BorderGlow.js';

/**
 * Aceternity UI `<BentoGrid>` and `<BentoGridItem>` (https://ui.aceternity.com/components/bento-grid)
 * Combined with ReactBits `<BorderGlow>` and taste-skill card specifications (1px hairline,
 * 24–32px padding, two-level hierarchy, no blurred rest shadow).
 */
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
            <p className="text-[13px] font-medium text-[#5a626a]">{title}</p>
            {value !== undefined ? (
              <p className="font-mono text-[34px] leading-none font-semibold tracking-tight text-[#0c0f12]">
                {value}
              </p>
            ) : null}
          </div>
          {icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#0c0f12]/10 bg-[#f4f4f2] text-[#0c0f12]">
              {icon}
            </div>
          ) : null}
        </div>
        {description ? (
          <div className="mt-4 border-t border-[#0c0f12]/[0.07] pt-3 text-[13px] text-[#5a626a]">
            {description}
          </div>
        ) : null}
      </BorderGlow>
    </motion.div>
  );
}

/**
 * Taste-Skill House Rule 7 Diagram Visual:
 * "One input, a main processor, three parallel lanes; pulses running along the lines in 3.2s cycles."
 * Visualizes ClinicFlow's real-time appointment verification & 30-minute conflict guard.
 */
export function ClinicalPulseDiagram() {
  return (
    <div
      data-visual
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#090d10] p-4 text-white"
    >
      <div className="mb-3 flex items-center justify-between text-[12px]">
        <span className="font-medium text-white/90">
          Moteur de validation PostgreSQL · Règle des 30 min
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-teal-400">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          EXCLUDE USING gist
        </span>
      </div>

      <svg
        viewBox="0 0 520 116"
        className="h-24 w-full"
        role="img"
        aria-label="Schéma du flux de validation des rendez-vous : requête entrante, contrôle de conflit 30 minutes, puis distribution vers En attente, Confirmé ou Conflit 409"
      >
        {/* Base connection tracks */}
        <path
          d="M 96 58 L 210 58"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 314 58 C 350 58, 355 24, 396 24"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 314 58 L 396 58"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 314 58 C 350 58, 355 92, 396 92"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Animated pulses along the tracks (3.2s cycle) */}
        <path
          d="M 96 58 L 210 58"
          stroke="#14b8a6"
          strokeWidth="2"
          fill="none"
          className="animate-diagram-pulse"
        />
        <path
          d="M 314 58 C 350 58, 355 24, 396 24"
          stroke="#f59e0b"
          strokeWidth="2"
          fill="none"
          className="animate-diagram-pulse"
        />
        <path
          d="M 314 58 L 396 58"
          stroke="#10b981"
          strokeWidth="2"
          fill="none"
          className="animate-diagram-pulse"
        />
        <path
          d="M 314 58 C 350 58, 355 92, 396 92"
          stroke="#f43f5e"
          strokeWidth="2"
          fill="none"
          className="animate-diagram-pulse"
        />

        {/* Input node */}
        <rect
          x="8"
          y="38"
          width="88"
          height="40"
          rx="8"
          fill="#12171c"
          stroke="rgba(255,255,255,0.18)"
        />
        <text x="52" y="55" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600">
          Nouveau RDV
        </text>
        <text x="52" y="69" textAnchor="middle" fill="#94a3b8" fontSize="9.5">
          POST / PATCH
        </text>

        {/* Central processor hub */}
        <rect
          x="210"
          y="32"
          width="104"
          height="52"
          rx="10"
          fill="#0f2926"
          stroke="#14b8a6"
          strokeWidth="1.25"
        />
        <text x="262" y="53" textAnchor="middle" fill="#5eead4" fontSize="11" fontWeight="600">
          Fenêtre ±15m
        </text>
        <text x="262" y="69" textAnchor="middle" fill="#cbd5e1" fontSize="9.5">
          |t₁ − t₂| ≥ 30 min
        </text>

        {/* Lane 1: Pending */}
        <rect
          x="396"
          y="8"
          width="116"
          height="30"
          rx="7"
          fill="#12171c"
          stroke="rgba(245,158,11,0.35)"
        />
        <circle cx="410" cy="23" r="3.5" fill="#f59e0b" />
        <text x="421" y="27" fill="#fde68a" fontSize="10.5" fontWeight="500">
          En attente (201)
        </text>

        {/* Lane 2: Confirmed */}
        <rect
          x="396"
          y="43"
          width="116"
          height="30"
          rx="7"
          fill="#0d241e"
          stroke="rgba(16,185,129,0.5)"
        />
        <circle cx="410" cy="58" r="3.5" fill="#10b981" />
        <text x="421" y="62" fill="#a7f3d0" fontSize="10.5" fontWeight="600">
          Confirmé (200)
        </text>

        {/* Lane 3: Conflict 409 */}
        <rect
          x="396"
          y="78"
          width="116"
          height="30"
          rx="7"
          fill="#12171c"
          stroke="rgba(244,63,94,0.35)"
        />
        <circle cx="410" cy="93" r="3.5" fill="#f43f5e" />
        <text x="421" y="97" fill="#fecdd3" fontSize="10.5" fontWeight="500">
          Conflit 30m (409)
        </text>
      </svg>
    </div>
  );
}
