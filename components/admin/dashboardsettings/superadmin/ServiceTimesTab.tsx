'use client';

import { useState, useEffect } from 'react';
import { useChurch } from '@/components/quicksetup/contexts/ChurchContext';
import { Input } from '@/components/ui/input';
import { getChurchId, updateChurch } from '@/lib/settingsApi';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Plus, Trash2, Clock, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ServiceTimesTab = () => {
  const { church, setChurch } = useChurch();
  const [services, setServices] = useState(church?.services || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const svc = church?.services;
    setServices(Array.isArray(svc) ? [...svc] : []);
  }, [church?.churchName, church?.services]);

  const addService = () => {
    const newService = {
      id: crypto.randomUUID(),
      day: 'Sunday',
      time: '09:00',
      label: '',
    };
    setServices((prev) => [...prev, newService]);
  };

  const remove = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const update = (id: string, field: string, value: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSave = async () => {
    const hasEmptyLabels = services.some((s) => !s.label.trim());
    if (hasEmptyLabels) {
      toast.error('Please provide a name for all services');
      return;
    }

    setChurch({ services });

    const churchId = getChurchId();
    if (churchId) {
      setSaving(true);
      try {
        await updateChurch(churchId, {
          service_times: services.map((s) => ({
            id: s.id,
            day: s.day,
            time: s.time,
            label: s.label,
          })),
        });
        toast.success('Service schedule updated', {
          description: 'Changes will reflect on your public church profile.',
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save service times');
      } finally {
        setSaving(false);
      }
    } else {
      toast.success('Service schedule updated (local only)', {
        description: 'Sign in to sync with the server.',
      });
    }
  };

  return (
    <div className="bg-[var(--admin-surface)] rounded-[24px] border border-[var(--admin-border)] p-8 space-y-8 max-w-3xl animate-in fade-in duration-500 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0B2A4A] tracking-tight">Service Times</h3>
            <p className="text-xs text-slate-400 font-medium">
              Define your weekly worship and meeting schedule.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={addService}
          className="rounded-xl border-slate-200 font-bold gap-2 text-[#0B2A4A] hover:bg-slate-50"
        >
          <Plus size={16} /> Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200">
          <CalendarDays className="text-slate-200 mb-4" size={48} />
          <p className="text-slate-400 font-bold text-sm">No services configured yet.</p>
          <button
            onClick={addService}
            className="mt-2 text-primary font-black text-xs hover:underline"
          >
            Click here to add your first service
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="group flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-muted/30 dark:bg-white/[0.04] border border-[var(--admin-border)] p-5 rounded-2xl hover:shadow-md dark:hover:ring-1 dark:hover:ring-white/10 transition-all animate-in slide-in-from-top-2"
            >
              <div className="flex-1 w-full space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Service Name
                </Label>
                <Input
                  className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
                  value={s.label}
                  placeholder="e.g. Sunday Morning Worship"
                  onChange={(e) => update(s.id, 'label', e.target.value)}
                />
              </div>

              <div className="w-full sm:w-40 space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Day</Label>
                <Select value={s.day} onValueChange={(v) => update(s.id, 'day', v)}>
                  <SelectTrigger className="h-12 bg-slate-50 border-none font-bold rounded-xl capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d} className="font-medium">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-32 space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Time</Label>
                <Input
                  type="time"
                  className="h-12 bg-slate-50 border-none font-bold rounded-xl"
                  value={s.time}
                  onChange={(e) => update(s.id, 'time', e.target.value)}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(s.id)}
                className="text-red-300 hover:text-red-500 hover:bg-red-50 h-12 w-12 rounded-xl shrink-0 transition-colors"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4">
        <Button
          onClick={handleSave}
          disabled={services.length === 0 || saving}
          className="bg-[#0B2A4A] hover:bg-[#081e36] text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Schedule'}
        </Button>
      </div>
    </div>
  );
};

export default ServiceTimesTab;
