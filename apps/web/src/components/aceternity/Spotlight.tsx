import { cn } from '../../lib/utils.js';

interface SpotlightProps {
  className?: string;
  fill?: string;
}

/**
 * Aceternity UI `<Spotlight>` component (https://ui.aceternity.com/components/spotlight)
 * Adapted with ClinicFlow's emerald/teal palette (no violet/lavender per taste-skill rule 6).
 */
export function Spotlight({ className, fill = '#14b8a6' }: SpotlightProps) {
  return (
    <svg
      className={cn(
        'pointer-events-none absolute z-[1] h-[150%] w-[135%] opacity-75 lg:w-[95%]',
        className,
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
      aria-hidden="true"
    >
      <g filter="url(#clinicflow-spotlight)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.22"
        />
      </g>
      <defs>
        <filter
          id="clinicflow-spotlight"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  );
}
