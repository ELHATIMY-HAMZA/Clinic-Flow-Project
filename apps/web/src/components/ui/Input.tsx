import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/utils.js';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[10px] border border-[#0F172A]/[0.14] bg-white px-3.5 py-2 text-[14px] text-[#0F172A] transition-[border-color,box-shadow] duration-140 placeholder:text-[#64748B]/70 focus:border-[#0284C7] focus:ring-3 focus:ring-[#0284C7]/15 focus:outline-none disabled:cursor-not-allowed disabled:bg-[#F4F7FB] disabled:opacity-65 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/15',
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
          'block text-[13px] font-medium text-[#0F172A] select-none',
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = 'Label';
