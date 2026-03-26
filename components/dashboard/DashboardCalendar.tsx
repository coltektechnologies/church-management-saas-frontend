'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DashboardCalendarProps {
  churchName?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Prefixed unused prop with _ to pass ESLint
const DashboardCalendar = ({
  churchName: _churchName = 'Seventh-Day Church',
}: DashboardCalendarProps) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; isToday: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, current: false, isToday: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    cells.push({ day: d, current: true, isToday });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, isToday: false });
  }

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground leading-tight">
              {MONTHS[month]} {year}
            </h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              Calendar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <button
            onClick={prev}
            className="hover:bg-card hover:shadow-sm rounded p-1 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={next}
            className="hover:bg-card hover:shadow-sm rounded p-1 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] text-muted-foreground mb-3 font-bold uppercase tracking-wider">
        {DAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center">
        {cells.map((c, i) => (
          <button
            key={i}
            className={`aspect-square flex items-center justify-center rounded-xl text-xs transition-all relative
              ${!c.current ? 'text-muted-foreground/30' : 'text-foreground font-medium'}
              ${c.isToday ? 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 scale-110 z-10' : 'hover:bg-muted'}
            `}
          >
            {c.day}
            {c.isToday && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardCalendar;
