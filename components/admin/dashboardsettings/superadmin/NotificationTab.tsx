'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferenceResponse,
} from '@/lib/settingsApi';

/** Map frontend keys to backend fields (used when building save payload) */
const _FRONT_TO_BACK: Record<string, keyof NotificationPreferenceResponse> = {
  newMember: 'announcements',
  announcement: 'announcements',
  financial: 'finance',
  events: 'events',
  approvals: 'reminders',
  system: 'announcements',
};

/** For load: which backend field drives which frontend key */
const BACK_TO_FRONT: Record<string, string[]> = {
  announcements: ['newMember', 'announcement', 'system'],
  finance: ['financial'],
  events: ['events'],
  reminders: ['approvals'],
};

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
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFS.map((p) => [p.key, true]))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationPreferences().then((data) => {
      if (data) {
        const next: Record<string, boolean> = {
          ...Object.fromEntries(PREFS.map((p) => [p.key, true])),
        };
        (
          Object.entries(BACK_TO_FRONT) as [keyof NotificationPreferenceResponse, string[]][]
        ).forEach(([backKey, frontKeys]) => {
          const val = data[backKey] !== false;
          frontKeys.forEach((fk) => {
            next[fk] = val;
          });
        });
        setPrefs(next);
      }
      setLoading(false);
    });
  }, []);

  const toggle = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    const payload: Partial<NotificationPreferenceResponse> = {
      announcements: prefs.announcement || prefs.newMember || prefs.system,
      finance: prefs.financial,
      events: prefs.events,
      reminders: prefs.approvals,
    };

    setSaving(true);
    try {
      await updateNotificationPreferences(payload);
      toast.success('Notification preferences updated', {
        description: 'You will receive alerts based on your new settings.',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
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
          disabled={loading || saving}
          className="bg-[#0B2A4A] hover:bg-[#081e36] text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all active:scale-95 disabled:opacity-70"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationTab;
