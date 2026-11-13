import { useId } from 'react';
import { cn } from '../lib/utils.js';

interface ClinicFlowLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showSubtitle?: boolean;
  subtitle?: string;
}

/**
 * Creative brand emblem for ClinicFlow:
 * Interlocking medical cross + fluid pulse wave inside a modern squircle,
 * symbolizing seamless patient care and appointment flow.
 * Uses `useId()` for SVG gradient IDs so multiple instances in responsive layouts never collide.
 */
export function ClinicFlowMark({ className = 'h-10 w-10' }: { className?: string }) {
  const rawId = useId().replace(/:/g, '');
  const bgGradId = `cf-bg-${rawId}`;
  const waveGradId = `cf-wave-${rawId}`;

  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgGradId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="55%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient
          id={waveGradId}
          x1="8"
          y1="22"
          x2="36"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>

      {/* Squircle Base */}
      <rect width="44" height="44" rx="13" fill="#0284C7" />
      <rect width="44" height="44" rx="13" fill={`url(#${bgGradId})`} />
      <rect
        x="0.75"
        y="0.75"
        width="42.5"
        height="42.5"
        rx="12.25"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />

      {/* Soft translucent medical cross backdrop */}
      <path
        d="M19 10C19 8.89543 19.8954 8 21 8H23C24.1046 8 25 8.89543 25 10V19H34C35.1046 19 36 19.8954 36 21V23C36 24.1046 35.1046 25 34 25H25V34C25 35.1046 24.1046 36 23 36H21C19.8954 36 19 35.1046 19 34V25H10C8.89543 25 8 24.1046 8 23V21C8 19.8954 8.89543 19 10 19H19V10Z"
        fill="white"
        fillOpacity="0.14"
      />

      {/* Fluid "C" Arc + Heartbeat Pulse Flow Line */}
      <path
        d="M28.5 13.5C26.7 12.2 24.4 11.5 22 11.5C15.9249 11.5 11 16.4249 11 22.5C11 28.5751 15.9249 33.5 22 33.5C24.8 33.5 27.35 32.45 29.3 30.7"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M14.5 22.5H18.5L20.8 17.5L24.2 27.5L26.8 22.5H33.5"
        stroke={`url(#${waveGradId})`}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Active Care Pulse Dot */}
      <circle cx="33.5" cy="14.5" r="2.6" fill="#34D399" />
    </svg>
  );
}

export function ClinicFlowLogo({
  className,
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
  subtitle = 'Gestion de cabinet médical',
}: ClinicFlowLogoProps) {
  const markSize = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-11 w-11' : 'h-10 w-10';
  const titleSize =
    size === 'sm' ? 'text-[16px]' : size === 'lg' ? 'text-[20px]' : 'text-[18px]';

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <ClinicFlowMark className={markSize} />
      <div>
        <div className={cn('leading-tight font-bold tracking-tight', titleSize)}>
          <span className={variant === 'light' ? 'text-white' : 'text-[#0F172A]'}>Clinic</span>
          <span className={variant === 'light' ? 'text-[#38BDF8]' : 'text-[#0284C7]'}>Flow</span>
        </div>
        {showSubtitle ? (
          <span
            className={cn(
              'mt-0.5 flex items-center gap-1.5 text-[12px] font-medium',
              variant === 'light' ? 'text-slate-300' : 'text-[#64748B]',
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}
