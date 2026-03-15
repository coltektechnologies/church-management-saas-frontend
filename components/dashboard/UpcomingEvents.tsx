'use client';

import { ExternalLink, Calendar, PlusCircle } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  department?: string;
}

interface UpcomingEventsProps {
  events?: EventItem[];
  onBrowseAll?: () => void;
  onAddEvent?: () => void;
}

const UpcomingEvents = ({ events = [], onBrowseAll, onAddEvent }: UpcomingEventsProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-[#0B2A4A] tracking-tight">Upcoming Events</h3>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
            Church Calendar
          </p>
        </div>
        <button
          onClick={onAddEvent}
          className="p-2 hover:bg-slate-100 rounded-full text-[#0B2A4A] transition-colors"
          title="Add New Event"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-xs font-bold text-slate-400">No events scheduled</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#0B2A4A]/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                  <Calendar size={18} className="group-hover:text-white text-[#0B2A4A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#0B2A4A] truncate">{event.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-primary uppercase">
                      {event.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {event.time}
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                <ExternalLink size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onBrowseAll}
          className="text-[11px] font-black text-primary uppercase tracking-tighter hover:text-[#0B2A4A] transition-colors w-full flex items-center justify-center gap-2"
        >
          View Full Calendar & Schedule →
        </button>
      </div>
    </div>
  );
};

export default UpcomingEvents;
