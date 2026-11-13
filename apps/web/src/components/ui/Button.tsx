import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

export const buttonVariants = cva(
  'btn-taste inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[14px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#0d9488] text-white hover:bg-[#0b7c72]',
        ink: 'bg-[#0c0f12] text-white hover:bg-[#1e242b]',
        secondary:
          'border border-[#0c0f12]/[0.14] bg-white text-[#0c0f12] hover:border-[#0c0f12]/25 hover:bg-[#f4f4f2]',
        destructive:
          'border border-rose-600/20 bg-rose-600 text-white hover:bg-rose-700',
        destructiveOutline:
          'border border-rose-600/25 bg-rose-50/70 text-rose-800 hover:border-rose-600/40 hover:bg-rose-100/80',
        ghost: 'text-[#5a626a] hover:bg-[#0c0f12]/[0.06] hover:text-[#0c0f12]',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-[8px] px-3.5 text-[13px]',
        xs: 'h-8 rounded-[8px] px-2.5 text-[12px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  withArrow?: boolean;
}

/**
 * shadcn/ui `<Button>` component with `design-taste-frontend` tactile hover/press physics
 * (`-1px` step on hover, `+1px` & `.985` scale on press, `.m-arrow` sliding 3px right).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withArrow = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
        {withArrow ? (
          <svg
            className="m-arrow h-3.5 w-3.5 shrink-0"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </button>
    );
  },
);
Button.displayName = 'Button';
