'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  BellRing,
  ShieldCheck,
  UserPlus,
  Megaphone,
  Banknote,
  CalendarDays,
  Settings,
} from 'lucide-react';

const PREFS = [
  {
    key: 'newMember',
    label: 'New Member Registrations',
    desc: 'Get notified immediately when someone joins the church.',
    icon: UserPlus,
  },
  {
    key: 'announcement',
    label: 'Announcements',
    desc: 'Alerts for new or pending church-wide announcements.',
    icon: Megaphone,
  },
  {
    key: 'financial',
    label: 'Financial Activity',
    desc: 'Real-time notifications for income, tithes, and expenses.',
    icon: Banknote,
  },
  {
    key: 'events',
    label: 'Upcoming Events',
    desc: 'Reminders for scheduled services and special events.',
    icon: CalendarDays,
  },
  {
    key: 'approvals',
    label: 'Pending Approvals',
    desc: 'Notifications for records or members awaiting review.',
    icon: ShieldCheck,
  },
  {
    key: 'system',
    label: 'System Updates',
    desc: 'Alerts for platform maintenance and new feature releases.',
    icon: Settings,
  },
];

const NotificationTab = () => {
  // Initialize preferences state - defaults to all true for new users
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFS.map((p) => [p.key, true]))
  );

  const toggle = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // In a real app, you would send 'prefs' to your backend here
    toast.success('Notification preferences updated', {
      description: 'You will receive alerts based on your new settings.',
    });
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <BellRing size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#0B2A4A] tracking-tight">
            Notification Settings
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Configure how and when you want to be alerted.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {PREFS.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.key} className="flex items-start justify-between gap-4 group">
              <div className="flex gap-4">
                <div className="mt-1 p-2 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                  <Icon size={18} className="text-slate-500" />
                </div>
                <div>
                  <Label
                    htmlFor={p.key}
                    className="text-sm font-bold text-[#0B2A4A] cursor-pointer"
                  >
                    {p.label}
                  </Label>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[350px]">{p.desc}</p>
                </div>
              </div>
              <Switch
                id={p.key}
                checked={prefs[p.key]}
                onCheckedChange={() => toggle(p.key)}
                className="data-[state=checked]:bg-[#2FC4B2]"
              />
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-50">
        <Button
          onClick={handleSave}
          className="bg-[#0B2A4A] hover:bg-[#081e36] text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all active:scale-95"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationTab;
