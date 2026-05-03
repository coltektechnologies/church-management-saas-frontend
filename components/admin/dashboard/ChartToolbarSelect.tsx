'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type ChartSelectOption = { value: string; label: string };

type ChartToolbarSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: ChartSelectOption[];
  /** Minimum width for the closed trigger (Tailwind class) */
  minWidthClass?: string;
  className?: string;
  /** Wider menu items */
  contentClassName?: string;
  /** Stretch to container width (e.g. inside a popover panel) */
  fullWidth?: boolean;
};

export function ChartToolbarSelect({
  value,
  onValueChange,
  options,
  minWidthClass,
  className,
  contentClassName,
  fullWidth = false,
}: ChartToolbarSelectProps) {
  const widthCls = fullWidth ? 'min-w-0 w-full' : (minWidthClass ?? 'min-w-[8rem]');

  return (
    <div className={cn(fullWidth ? 'w-full' : 'shrink-0')}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          size="sm"
          className={cn(
            'h-9 px-3 text-xs font-medium shadow-sm bg-background border-border',
            fullWidth && 'w-full justify-between',
            widthCls,
            className
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={6}
          align="end"
          className={cn('z-[2147483642] max-h-72 overflow-y-auto', contentClassName)}
        >
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs py-2.5 pr-10 pl-2">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
