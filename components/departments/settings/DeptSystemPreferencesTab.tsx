'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
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
import {
  Settings2,
  Globe,
  Coins,
  Calendar,
  Moon,
  Sun,
  HardDriveDownload,
  Type,
  Search,
  Check,
  ChevronDown,
} from 'lucide-react';

// ── Font catalogue ─────────────────────────────────────────────────────────────
const FONT_CATALOGUE = [
  { value: 'Inter', label: 'Inter', category: 'Modern' },
  { value: 'Poppins', label: 'Poppins', category: 'Modern' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Modern' },
  { value: 'Nunito', label: 'Nunito', category: 'Modern' },
  { value: 'Outfit', label: 'Outfit', category: 'Modern' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Modern' },
  { value: 'Roboto', label: 'Roboto', category: 'Professional' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Professional' },
  { value: 'Lato', label: 'Lato', category: 'Professional' },
  { value: 'Noto Sans', label: 'Noto Sans', category: 'Professional' },
  { value: 'Source Sans 3', label: 'Source Sans 3', category: 'Professional' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Editorial' },
  { value: 'Lora', label: 'Lora', category: 'Editorial' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Editorial' },
  { value: 'Georgia', label: 'Georgia', category: 'System' },
  { value: 'Arial', label: 'Arial', category: 'System' },
  { value: 'Verdana', label: 'Verdana', category: 'System' },
  { value: 'Fira Code', label: 'Fira Code', category: 'Code' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Code' },
];

const FONT_SIZES = ['11', '12', '13', '14', '15', '16', '18', '20'];
const SYSTEM_FONTS = new Set(['Georgia', 'Arial', 'Verdana']);

function buildGoogleFontsUrl() {
  return `https://fonts.googleapis.com/css2?${FONT_CATALOGUE.filter(
    (f) => !SYSTEM_FONTS.has(f.value)
  )
    .map((f) => `family=${encodeURIComponent(f.value)}:wght@300;400;500;600;700;800`)
    .join('&')}&display=swap`;
}

function injectGoogleFonts() {
  if (typeof document === 'undefined') {
    return;
  }
  const id = 'dept-google-fonts';
  if (document.getElementById(id)) {
    return;
  }
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = buildGoogleFontsUrl();
  document.head.appendChild(link);
}

function applyFontToRoot(family: string, sizePx: string) {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.querySelector('[data-department-theme]') as HTMLElement | null;
  if (!root) {
    return;
  }
  root.style.setProperty('--dept-font-family', `'${family}', system-ui, sans-serif`);
  root.style.setProperty('--dept-font-size', `${sizePx}px`);
}

// ── Font family dropdown ──────────────────────────────────────────────────────
function FontFamilyDropdown({
  value,
  onChange,
  accentColor,
}: {
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? FONT_CATALOGUE.filter((f) => f.label.toLowerCase().includes(query.toLowerCase()))
    : FONT_CATALOGUE;
  const categories = Array.from(new Set(filtered.map((f) => f.category)));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setQuery('');
        }}
        className="w-full flex items-center justify-between h-10 px-3 rounded-xl bg-muted/20 border border-border hover:border-border/80 transition-colors"
      >
        <span
          className="text-sm font-medium text-foreground truncate pr-2"
          style={{ fontFamily: `'${value}', system-ui, sans-serif` }}
        >
          {value}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          style={{ maxHeight: '320px', display: 'flex', flexDirection: 'column' }}
        >
          <div className="p-2 border-b border-border flex items-center gap-2 flex-shrink-0">
            <Search size={13} className="text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search fonts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="flex-1 text-xs bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {categories.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-4">
                No fonts match &ldquo;{query}&rdquo;
              </p>
            ) : (
              categories.map((cat) => (
                <div key={cat}>
                  <div className="px-3 py-1.5 bg-muted/10 sticky top-0 z-10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      {cat}
                    </p>
                  </div>
                  {filtered
                    .filter((f) => f.category === cat)
                    .map((font) => {
                      const selected = value === font.value;
                      return (
                        <button
                          key={font.value}
                          type="button"
                          onClick={() => {
                            onChange(font.value);
                            setOpen(false);
                            setQuery('');
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors text-left"
                          style={{ backgroundColor: selected ? `${accentColor}12` : undefined }}
                        >
                          <span
                            className="text-sm text-foreground"
                            style={{ fontFamily: `'${font.value}', system-ui, sans-serif` }}
                          >
                            {font.label}
                          </span>
                          {selected && (
                            <Check size={13} style={{ color: accentColor, flexShrink: 0 }} />
                          )}
                        </button>
                      );
                    })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Font size dropdown ────────────────────────────────────────────────────────
function FontSizeDropdown({
  value,
  onChange,
  accentColor,
}: {
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-24">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between h-10 px-3 rounded-xl bg-muted/20 border border-border hover:border-border/80 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{value}px</span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-28">
          {FONT_SIZES.map((s) => {
            const sel = value === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors"
                style={{ backgroundColor: sel ? `${accentColor}12` : undefined }}
              >
                <span className="text-sm text-foreground">{s}px</span>
                {sel && <Check size={13} style={{ color: accentColor }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Dark mode pill ────────────────────────────────────────────────────────────
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

// ── Main component ────────────────────────────────────────────────────────────
export default function DeptSystemPreferencesTab() {
  const { profile, updateProfile, toggleDarkMode, isReady } = useDepartmentProfile();

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

  // Font state — initialised from saved profile
  const [fontFamily, setFontFamilyState] = useState(profile.fontFamily || 'Inter');
  const [fontSize, setFontSizeState] = useState(profile.fontSize || '14');

  useEffect(() => {
    injectGoogleFonts();
  }, []);

  // Apply font live whenever it changes
  useEffect(() => {
    applyFontToRoot(fontFamily, fontSize);
  }, [fontFamily, fontSize]);

  // Sync from profile when ready (first load)
  const syncedRef = useRef(false);
  useEffect(() => {
    if (!isReady || syncedRef.current) {
      return;
    }
    syncedRef.current = true;
    setFontFamilyState(profile.fontFamily || 'Inter');
    setFontSizeState(profile.fontSize || '14');
    applyFontToRoot(profile.fontFamily || 'Inter', profile.fontSize || '14');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const up = (patch: Partial<typeof form>) => setForm((p) => ({ ...p, ...patch }));

  const handleSaveRegional = () => {
    updateProfile({ ...form });
    toast.success('System preferences saved', { description: 'Regional settings updated.' });
  };

  const handleApplyFont = useCallback(() => {
    applyFontToRoot(fontFamily, fontSize);
    updateProfile({ fontFamily, fontSize });
    toast.success('Font applied!', { description: `${fontFamily} ${fontSize}px is now active.` });
  }, [fontFamily, fontSize, updateProfile]);

  const handleResetFont = () => {
    setFontFamilyState('Inter');
    setFontSizeState('14');
    applyFontToRoot('Inter', '14');
    updateProfile({ fontFamily: 'Inter', fontSize: '14' });
    toast.info('Font reset to Inter 14px.');
  };

  return (
    <div className="bg-card rounded-[24px] border border-border p-6 sm:p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
      {/* Header */}
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

      {/* ── Typography ─────────────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type size={15} className="text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Typography
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFont}
              className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApplyFont}
              className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-white transition-all active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              Apply
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground ml-1">Font Family</p>
            <FontFamilyDropdown
              value={fontFamily}
              onChange={setFontFamilyState}
              accentColor={accentColor}
            />
          </div>
          <div className="space-y-1 flex-shrink-0">
            <p className="text-[10px] font-semibold text-muted-foreground ml-1">Size</p>
            <FontSizeDropdown
              value={fontSize}
              onChange={setFontSizeState}
              accentColor={accentColor}
            />
          </div>
        </div>

        {/* Live preview card */}
        <div
          className="p-4 rounded-2xl border border-border bg-muted/5 transition-all duration-200"
          style={{
            fontFamily: `'${fontFamily}', system-ui, sans-serif`,
            fontSize: `${fontSize}px`,
            lineHeight: '1.6',
          }}
        >
          <p
            className="font-bold text-foreground"
            style={{ fontSize: `${Number(fontSize) + 3}px` }}
          >
            Department Dashboard Heading
          </p>
          <p className="text-muted-foreground mt-1">
            The quick brown fox jumps over the lazy dog. 0123456789
          </p>
          <p
            className="font-semibold text-foreground mt-2"
            style={{ fontSize: `${Math.max(10, Number(fontSize) - 1)}px` }}
          >
            Label ·{' '}
            <span className="font-normal text-muted-foreground">Secondary text · ₵1,250.00</span>
          </p>
        </div>
      </div>

      {/* ── Toggles ─────────────────────────────────────────────────────────── */}
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
        onClick={handleSaveRegional}
        className="w-full sm:w-auto px-10 h-12 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-white"
        style={{ backgroundColor: accentColor }}
      >
        Save Preferences
      </Button>
    </div>
  );
}
