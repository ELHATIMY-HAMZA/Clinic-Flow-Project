import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

export interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Radial border glow color following the pointer (defaults to Medical Cerulean). */
  glowColor?: string;
  /** Subtle surface spotlight color inside the card. */
  spotlightColor?: string;
  /** Border radius token (default 20px). */
  radius?: string;
  /** Lift 2px on hover when the card acts as an interactive tile. */
  interactive?: boolean;
}

export function BorderGlow({
  children,
  className,
  containerClassName,
  glowColor = 'rgba(2, 132, 199, 0.72)',
  spotlightColor = 'rgba(2, 132, 199, 0.04)',
  radius = '20px',
  interactive = false,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      style={
        {
          '--glow-color': glowColor,
          '--spotlight-color': spotlightColor,
          '--border-radius': radius,
        } as CSSProperties
      }
      className={cn(
        'border-glow-card border border-[#0F172A]/[0.09] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]',
        interactive && 'card-lift',
        containerClassName,
      )}
    >
      <div className="border-glow-effect" aria-hidden="true" />
      <div className="border-glow-spotlight" aria-hidden="true" />
      <div className={cn('relative z-10 h-full w-full rounded-[inherit]', className)}>
        {children}
      </div>
    </div>
  );
}
