import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[10px] border border-[#0c0f12]/[0.15] bg-white px-3.5 py-2 text-[14px] text-[#0c0f12] transition-[border-color,box-shadow] duration-140 placeholder:text-[#5a626a]/65 focus:border-[#0d9488] focus:ring-3 focus:ring-[#0d9488]/15 focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f4f4f2] disabled:opacity-65 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/15',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-[13px] font-medium text-[#0c0f12] select-none',
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = 'Label';
