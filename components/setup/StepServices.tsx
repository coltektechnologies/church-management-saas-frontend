'use client';

import { Plus, Trash2, Clock } from 'lucide-react';

export interface ServiceTime {
  id: string;
  day: string;
  time: string;
  label: string;
}

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface StepServicesProps {
  services: ServiceTime[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof ServiceTime, value: string) => void;
}

const StepServices = ({ services, onAdd, onRemove, onUpdate }: StepServicesProps) => (
  <div className="animate-in fade-in duration-500">
    <div className="flex items-center gap-2 mb-1">
      <Clock size={16} className="text-[#2FC4B2]" />
      <label className="text-sm font-bold text-[#0B2A4A] block">Service Times</label>
    </div>
    <p className="text-xs text-muted-foreground mb-5">Add your regular worship services.</p>

    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
      {services.map((svc) => (
        <div
          key={svc.id}
          className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white rounded-xl p-3 border border-border shadow-sm group"
        >
          <select
            value={svc.day}
            onChange={(e) => onUpdate(svc.id, 'day', e.target.value)}
            className="form-input-od text-xs py-2 flex-1 min-w-[100px] cursor-pointer"
          >
            {/* The fix: Corrected the map syntax here */}
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="time"
            value={svc.time}
            onChange={(e) => onUpdate(svc.id, 'time', e.target.value)}
            className="form-input-od text-xs py-2 w-[110px] cursor-text"
          />

          <input
            type="text"
            placeholder="Label (e.g. Morning Glow)"
            value={svc.label}
            onChange={(e) => onUpdate(svc.id, 'label', e.target.value)}
            className="form-input-od text-xs py-2 flex-1 min-w-[120px]"
          />

          <button
            type="button"
            onClick={() => onRemove(svc.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 group-hover:scale-110"
            aria-label="Remove service"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>

    <button
      type="button"
      onClick={onAdd}
      className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-[#2FC4B2] font-bold py-3 border-2 border-dashed border-[#2FC4B2]/30 rounded-xl hover:bg-[#2FC4B2]/5 transition-all active:scale-[0.98]"
    >
      <Plus size={16} /> Add New Service
    </button>
  </div>
);

export default StepServices;
