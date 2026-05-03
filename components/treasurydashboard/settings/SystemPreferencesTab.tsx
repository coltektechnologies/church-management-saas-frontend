'use client';

import { useState } from 'react';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings2, Globe, Coins, Calendar, Moon, Sun, HardDriveDownload } from 'lucide-react';
import { FontSettings } from '@/components/secretary/settings/FontSettings';

function DarkModePill({
  isDark,
  onToggle,
  accentColor,
}: {
  isDark: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative focus:outline-none flex-shrink-0"
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: isDark ? accentColor : '#D1D5DB',
        transition: 'background-color 0.25s ease',
      }}
    >
      <span
        className="absolute bg-white rounded-full shadow"
        style={{
          top: '3px',
          width: '18px',
          height: '18px',
          left: isDark ? '23px' : '3px',
          transition: 'left 0.25s ease',
        }}
      />
    </button>
  );
}

export default function SystemPreferencesTab() {
  const { profile, updateProfile, toggleDarkMode, isReady } = useTreasuryProfile();

  const isDark = isReady ? profile.darkMode : false;
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const [form, setForm] = useState({
    language: profile.language || 'en',
    currency: profile.currency || 'GHS',
    dateFormat: profile.dateFormat || 'DD/MM/YYYY',
    autoBackup: profile.autoBackup ?? false,
  });

  const up = (patch: Partial<typeof form>) => setForm((p) => ({ ...p, ...patch }));

  const handleSave = () => {
    updateProfile({ ...form });
    toast.success('System preferences saved', { description: 'Regional settings updated.' });
  };

  return (
    <div className="bg-card rounded-[24px] border border-border p-6 sm:p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
        >
          <Settings2 size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-foreground tracking-tight">System Preferences</h3>
          <p className="text-xs text-muted-foreground font-medium">
            Regional settings, typography, and localisation.
          </p>
        </div>
      </div>

      {/* Regional selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={13} className="text-muted-foreground" />
            <Label className="text-[10px] font-black uppercase text-muted-foreground">
              Language
            </Label>
          </div>
          <Select value={form.language} onValueChange={(v) => up({ language: v })}>
            <SelectTrigger className="h-12 bg-muted/20 border-none font-bold rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="en">English (UK)</SelectItem>
              <SelectItem value="fr">French (Français)</SelectItem>
              <SelectItem value="tw">Twi (Ghana)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Coins size={13} className="text-muted-foreground" />
            <Label className="text-[10px] font-black uppercase text-muted-foreground">
              Default Currency
            </Label>
          </div>
          <Select value={form.currency} onValueChange={(v) => up({ currency: v })}>
            <SelectTrigger className="h-12 bg-muted/20 border-none font-bold rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="GHS">GHS (₵) — Cedi</SelectItem>
              <SelectItem value="USD">USD ($) — Dollar</SelectItem>
              <SelectItem value="GBP">GBP (£) — Pound</SelectItem>
              <SelectItem value="EUR">EUR (€) — Euro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={13} className="text-muted-foreground" />
            <Label className="text-[10px] font-black uppercase text-muted-foreground">
              Date Format
            </Label>
          </div>
          <Select value={form.dateFormat} onValueChange={(v) => up({ dateFormat: v })}>
            <SelectTrigger className="h-12 bg-muted/20 border-none font-bold rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Typography */}
      <div className="pt-4 border-t border-border">
        <FontSettings
          initialFamily={profile.fontFamily || 'Poppins'}
          initialSize={profile.fontSize || '14'}
          accentColor={accentColor}
          onSave={(family, size) => updateProfile({ fontFamily: family, fontSize: size })}
        />
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4 border-t border-border">
        {/* Dark mode */}
        <div className="flex items-center justify-between p-4 bg-muted/10 border border-border rounded-2xl">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="p-2 bg-card rounded-xl shadow-sm text-muted-foreground flex-shrink-0">
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div className="min-w-0">
              <Label className="text-sm font-bold text-foreground">Dark Mode</Label>
              <p className="text-xs text-muted-foreground truncate">
                {isDark
                  ? 'Currently dark — toggle for light.'
                  : 'Currently light — toggle for dark.'}
              </p>
            </div>
          </div>
          <DarkModePill isDark={isDark} onToggle={toggleDarkMode} accentColor={accentColor} />
        </div>

        {/* Auto backup */}
        <div className="flex items-center justify-between p-4 bg-muted/10 border border-border rounded-2xl">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="p-2 bg-card rounded-xl shadow-sm text-muted-foreground flex-shrink-0">
              <HardDriveDownload size={18} />
            </div>
            <div className="min-w-0">
              <Label className="text-sm font-bold text-foreground">Auto Cloud Backup</Label>
              <p className="text-xs text-muted-foreground italic truncate">
                Weekly — Sunday @ 12:00 AM
              </p>
            </div>
          </div>
          <button
            onClick={() => up({ autoBackup: !form.autoBackup })}
            role="switch"
            aria-checked={form.autoBackup}
            className="relative focus:outline-none flex-shrink-0"
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              backgroundColor: form.autoBackup ? accentColor : '#D1D5DB',
              transition: 'background-color 0.25s ease',
            }}
          >
            <span
              className="absolute bg-white rounded-full shadow"
              style={{
                top: '3px',
                width: '18px',
                height: '18px',
                left: form.autoBackup ? '23px' : '3px',
                transition: 'left 0.25s ease',
              }}
            />
          </button>
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="w-full sm:w-auto px-10 h-12 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-white"
        style={{ backgroundColor: accentColor }}
      >
        Save Preferences
      </Button>
    </div>
  );
}
