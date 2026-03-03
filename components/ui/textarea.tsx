'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full px-4 py-3 text-sm rounded-xl transition-all',
          'bg-slate-50 border-none text-[#0B2A4A] placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2A4A]/10 focus-visible:bg-white focus-visible:shadow-sm',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'font-bold leading-relaxed',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
export { Textarea };
export type { TextareaProps };
