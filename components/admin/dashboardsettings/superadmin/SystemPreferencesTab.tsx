'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings2, Globe, Coins, Calendar, Moon, HardDriveDownload } from 'lucide-react';

const SystemPreferencesTab = () => {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('GHS');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSave = () => {
    toast.success('System preferences updated', {
      description: 'Regional settings and display modes have been saved.',
    });
  };

  return (
    <div className="bg-[var(--admin-surface)] rounded-[24px] border border-[var(--admin-border)] p-8 space-y-8 max-w-2xl animate-in fade-in duration-500 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Settings2 size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#0B2A4A] tracking-tight">System Preferences</h3>
          <p className="text-xs text-slate-400 font-medium">
            Regional settings and localization controls.
          </p>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={14} className="text-slate-400" />
            <Label className="text-[10px] font-black uppercase text-slate-400">Language</Label>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 font-medium">
              <SelectItem value="en">English (UK)</SelectItem>
              <SelectItem value="fr">French (Français)</SelectItem>
              <SelectItem value="tw">Twi (Ghana)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Coins size={14} className="text-slate-400" />
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Default Currency
            </Label>
          </div>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 font-medium">
              <SelectItem value="GHS">GHS (₵) - Cedi</SelectItem>
              <SelectItem value="USD">USD ($) - Dollar</SelectItem>
              <SelectItem value="GBP">GBP (£) - Pound</SelectItem>
              <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-slate-400" />
            <Label className="text-[10px] font-black uppercase text-slate-400">
              Date Display Format
            </Label>
          </div>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 font-medium">
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Day Month Year)</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (Month Day Year)</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="space-y-4 pt-4 border-t border-slate-50">
        <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl group transition-all">
          <div className="flex gap-4">
            <div className="p-2 bg-muted/50 dark:bg-white/5 rounded-xl shadow-sm text-muted-foreground group-hover:text-[color:var(--primary-brand)] transition-colors border border-[var(--admin-border)]">
              <Moon size={18} />
            </div>
            <div>
              <Label className="text-sm font-bold text-[#0B2A4A]">Dark Mode</Label>
              <p className="text-xs text-slate-400">Reduce eye strain with a darker interface.</p>
            </div>
          </div>
          <Switch
            checked={darkMode}
            onCheckedChange={setDarkMode}
            className="data-[state=checked]:bg-[#2FC4B2]"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl group transition-all">
          <div className="flex gap-4">
            <div className="p-2 bg-muted/50 dark:bg-white/5 rounded-xl shadow-sm text-muted-foreground group-hover:text-[color:var(--primary-brand)] transition-colors border border-[var(--admin-border)]">
              <HardDriveDownload size={18} />
            </div>
            <div>
              <Label className="text-sm font-bold text-[#0B2A4A]">Auto Cloud Backup</Label>
              <p className="text-xs text-slate-400 font-medium italic underline decoration-primary/20">
                Frequency: Weekly (Sunday @ 12:00 AM)
              </p>
            </div>
          </div>
          <Switch
            checked={autoBackup}
            onCheckedChange={setAutoBackup}
            className="data-[state=checked]:bg-[#2FC4B2]"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={handleSave}
          className="bg-[#0B2A4A] hover:bg-[#081e36] text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all active:scale-95"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default SystemPreferencesTab;
