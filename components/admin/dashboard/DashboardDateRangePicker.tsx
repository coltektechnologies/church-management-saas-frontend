'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import type { DateRange as DRPDateRange } from 'react-day-picker';

export default function DashboardDateRangePicker() {
  const { dateRange, setDateRange } = useAppData();
  const [open, setOpen] = useState(false);

  const selected: DRPDateRange | undefined =
    dateRange.from || dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined;

  const handleSelect = (range: DRPDateRange | undefined) => {
    setDateRange({ from: range?.from, to: range?.to });
  };

  const clear = () => setDateRange({ from: undefined, to: undefined });

  const hasRange = dateRange.from || dateRange.to;

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 sm:h-9 text-[10px] sm:text-xs gap-1.5 font-medium border-border rounded-full px-3',
              !hasRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {dateRange.from
              ? dateRange.to
                ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yyyy')}`
                : format(dateRange.from, 'MMM d, yyyy')
              : 'Filter by date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
            initialFocus
            className={cn('p-3 pointer-events-auto')}
          />
          <div className="border-t border-border p-2 flex justify-between items-center">
            <p className="text-[10px] text-muted-foreground">
              Select a date range to filter dashboard
            </p>
            {hasRange && (
              <Button variant="ghost" size="sm" onClick={clear} className="h-7 text-xs">
                Clear
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {hasRange && (
        <button
          onClick={clear}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
