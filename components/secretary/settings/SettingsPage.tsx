'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { User, Palette, CalendarDays, BellRing, ShieldCheck, Settings2 } from 'lucide-react';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';

import MyProfileTab from '@/components/secretary/settings/MyProfileTab';
import ColorThemeTab from '@/components/secretary/settings/ColorThemeTab';
import EventsScheduleTab from '@/components/secretary/settings/EventsScheduleTab';
import NotificationTab from '@/components/secretary/settings/NotificationTab';
import SecurityTab from '@/components/secretary/settings/SecurityTab';
import SystemPreferencesTab from '@/components/secretary/settings/SystemPreferencesTab';

const TABS = [
  { value: 'profile', label: 'My Profile', shortLabel: 'Profile', icon: User },
  { value: 'theme', label: 'Appearance', shortLabel: 'Appearance', icon: Palette },
  { value: 'events', label: 'Events & Schedule', shortLabel: 'Events', icon: CalendarDays },
  { value: 'notifications', label: 'Notifications', shortLabel: 'Alerts', icon: BellRing },
  { value: 'security', label: 'Security', shortLabel: 'Security', icon: ShieldCheck },
  { value: 'system', label: 'System Preferences', shortLabel: 'System', icon: Settings2 },
];

const TAB_MAP: Record<string, React.ReactNode> = {
  profile: <MyProfileTab />,
  theme: <ColorThemeTab />,
  events: <EventsScheduleTab />,
  notifications: <NotificationTab />,
  security: <SecurityTab />,
  system: <SystemPreferencesTab />,
};

function autoText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'profile';

  const { profile, isReady } = useSecretaryProfile();
  const isDark = isReady ? profile.darkMode : false;

  const primaryColor = isReady
    ? isDark
      ? profile.darkPrimaryColor || '#1A3F6B'
      : profile.primaryColor || '#0B2A4A'
    : '#0B2A4A';
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';
  const primaryText = autoText(primaryColor);

  const go = (value: string) => router.push(`/secretary/settings?tab=${value}`, { scroll: false });

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      {/* Page title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile, appearance, events, and preferences.
        </p>
      </div>

      {/* ── Mobile: horizontally scrollable segmented tab bar ──────────────── */}
      <div className="md:hidden w-full">
        {/* Outer container clips overflow, inner scrolls */}
        <div className="bg-card border border-border rounded-2xl p-1.5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {TABS.map((tab) => {
              const active = activeTab === tab.value;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => go(tab.value)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  style={{
                    backgroundColor: active ? primaryColor : 'transparent',
                    color: active ? primaryText : `${primaryColor}90`,
                    boxShadow: active ? `0 1px 6px ${primaryColor}30` : 'none',
                  }}
                >
                  <Icon
                    size={13}
                    className="flex-shrink-0"
                    style={{ color: active ? accentColor : `${primaryColor}70` }}
                  />
                  {tab.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
        {/* Tab content on mobile — full width below the tab bar */}
        <div className="mt-4 w-full">{TAB_MAP[activeTab] ?? <MyProfileTab />}</div>
      </div>

      {/* ── Desktop: vertical sidebar + content side by side ──────────────── */}
      <div className="hidden md:flex gap-6 items-start">
        <div className="w-[220px] flex-shrink-0 sticky top-[72px] self-start">
          <aside className="flex flex-col bg-card border border-border rounded-xl p-2 space-y-0.5">
            {TABS.map((tab) => {
              const active = activeTab === tab.value;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => go(tab.value)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all duration-200 text-left"
                  style={{
                    borderRadius: active ? '0px' : '8px',
                    background: active ? primaryColor : 'transparent',
                    ...(active && { borderLeft: `4px solid ${accentColor}` }),
                    color: active ? primaryText : primaryColor,
                  }}
                >
                  <Icon
                    size={16}
                    className="flex-shrink-0"
                    style={{ color: active ? accentColor : primaryColor }}
                  />
                  {tab.label}
                </button>
              );
            })}
          </aside>
        </div>

        <div className="flex-1 min-w-0 w-full">{TAB_MAP[activeTab] ?? <MyProfileTab />}</div>
      </div>
    </div>
  );
}
