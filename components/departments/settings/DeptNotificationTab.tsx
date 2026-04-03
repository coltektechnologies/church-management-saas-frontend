'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  BellRing,
  UserPlus,
  Megaphone,
  Wallet,
  CalendarDays,
  Settings,
  ShieldCheck,
} from 'lucide-react';

type NotifKey = 'newMember' | 'announcement' | 'financial' | 'events' | 'approvals' | 'system';

const PREFS: { key: NotifKey; label: string; desc: string; icon: React.ElementType }[] = [
  {
    key: 'newMember',
    label: 'New Member Registrations',
    desc: 'Get notified when someone joins your department.',
    icon: UserPlus,
  },
  {
    key: 'announcement',
    label: 'Announcements',
    desc: 'Alerts for new or pending department announcements.',
    icon: Megaphone,
  },
  {
    key: 'financial',
    label: 'Financial Activity',
    desc: 'Notifications for expense requests and budget updates.',
    icon: Wallet,
  },
  {
    key: 'events',
    label: 'Upcoming Activities',
    desc: 'Reminders for scheduled activities and events.',
    icon: CalendarDays,
  },
  {
    key: 'approvals',
    label: 'Pending Approvals',
    desc: 'Notifications for items awaiting review or approval.',
    icon: ShieldCheck,
  },
  {
    key: 'system',
    label: 'System Updates',
    desc: 'Alerts for platform maintenance and new features.',
    icon: Settings,
  },
];

const DEFAULT_NOTIFICATIONS: Record<NotifKey, boolean> = {
  newMember: true,
  announcement: true,
  financial: false,
  events: true,
  approvals: true,
  system: false,
};

export default function DeptNotificationTab() {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const toggle = (key: NotifKey) => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    toast.success('Notification preferences updated', {
      description: 'You will receive alerts based on your new settings.',
    });
  };

  return (
    <div className="bg-card rounded-[24px] border border-border p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <BellRing size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-foreground tracking-tight">
            Notification Settings
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
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
                <div className="mt-1 p-2 bg-muted/20 rounded-xl group-hover:bg-muted/40 transition-colors">
                  <Icon size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <Label
                    htmlFor={p.key}
                    className="text-sm font-bold text-foreground cursor-pointer"
                  >
                    {p.label}
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[350px]">
                    {p.desc}
                  </p>
                </div>
              </div>
              <Switch
                id={p.key}
                checked={notifications[p.key]}
                onCheckedChange={() => toggle(p.key)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border">
        <Button
          onClick={handleSave}
          className="px-8 h-12 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
