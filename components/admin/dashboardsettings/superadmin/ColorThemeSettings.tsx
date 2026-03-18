'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Save, Sun, Moon, RotateCcw } from 'lucide-react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';

// ── Constants ──────────────────────────────────────────────────────────────────
const DEFAULT_COLORS = {
  primary: '#0B2A4A',
  accent: '#2FC4B2',
  sidebar: '#ffffff',
  bg: '#FFFFFF',
};

// ── Extended profile type to avoid `any` casts ─────────────────────────────────
interface ExtendedProfile {
  primaryColor?: string;
  accentColor?: string;
  sidebarColor?: string;
  backgroundColor?: string;
  darkMode?: boolean;
}

// ── Utilities ──────────────────────────────────────────────────────────────────
const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) || 0,
    g: parseInt(h.substring(2, 4), 16) || 0,
    b: parseInt(h.substring(4, 6), 16) || 0,
  };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6;
    } else {
      h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const getBestTextColor = (bgHex: string): string => {
  const { r, g, b } = hexToRgb(bgHex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.179 ? '#0B2A4A' : '#FFFFFF';
};

// ── Advanced Color Picker ──────────────────────────────────────────────────────
const AdvancedColorPicker = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const [mode, setMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [textInput, setTextInput] = useState(value);

  const getDisplayValue = useCallback((val: string, m: string) => {
    const rgb = hexToRgb(val);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    if (m === 'rgb') {
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
    if (m === 'hsl') {
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    return val;
  }, []);

  useEffect(() => {
    setTextInput(getDisplayValue(value, mode));
  }, [value, mode, getDisplayValue]);

  const textColor = getBestTextColor(value);

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-lg border-2 border-slate-200 shadow-sm flex items-center justify-center"
            style={{ backgroundColor: value }}
          >
            <span
              className="text-[9px] font-black pointer-events-none"
              style={{ color: textColor }}
            >
              Aa
            </span>
          </div>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        <input
          type="text"
          value={textInput}
          onChange={(e) => {
            setTextInput(e.target.value);
            if (e.target.value.startsWith('#') && e.target.value.length === 7) {
              onChange(e.target.value);
            }
          }}
          className="flex-1 min-w-0 font-mono text-xs py-2 px-3 rounded-md border border-slate-200 bg-white dark:bg-white/5 dark:border-white/10 dark:text-white"
        />

        <div
          className="shrink-0 px-2 py-1 rounded-md text-[9px] font-black border"
          style={{
            backgroundColor: value,
            color: textColor,
            borderColor: 'rgba(0,0,0,0.10)',
          }}
        >
          {textColor === '#FFFFFF' ? 'Light' : 'Dark'}
        </div>
      </div>

      <div className="flex gap-1">
        {(['hex', 'rgb', 'hsl'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
              mode === m
                ? 'bg-[#0B2A4A] text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/10 dark:text-white/40'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ColorThemeSettings() {
  const { profile, updateProfile, toggleDarkMode, isReady } = useChurchProfile();

  // Cast once to extended type — avoids repeated `any` casts throughout
  const extProfile = profile as ExtendedProfile | null;

  // Derive initial colors directly from profile so we never need setState in an effect
  const [colors, setColors] = useState(() => ({
    primary: extProfile?.primaryColor || DEFAULT_COLORS.primary,
    accent: extProfile?.accentColor || DEFAULT_COLORS.accent,
    sidebar: extProfile?.sidebarColor || DEFAULT_COLORS.sidebar,
    bg: extProfile?.backgroundColor || DEFAULT_COLORS.bg,
  }));

  const [saved, setSaved] = useState(false);

  // Sync when the profile finishes loading (isReady transitions false → true)
  // We only run this once on ready, so the dependency array is intentionally [isReady]
  useEffect(() => {
    if (!isReady || !extProfile) {
      return;
    }
    setColors({
      primary: extProfile.primaryColor || DEFAULT_COLORS.primary,
      accent: extProfile.accentColor || DEFAULT_COLORS.accent,
      sidebar: extProfile.sidebarColor || DEFAULT_COLORS.sidebar,
      bg: extProfile.backgroundColor || DEFAULT_COLORS.bg,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const isDark = extProfile?.darkMode ?? false;

  const previewData = useMemo(() => {
    const bg = isDark ? '#0A1628' : colors.bg;
    const sidebar = isDark ? '#0B2A4A' : colors.sidebar;
    const textColor = isDark ? '#FFFFFF' : getBestTextColor(colors.bg);
    const subColor = isDark
      ? 'rgba(255,255,255,0.35)'
      : getBestTextColor(colors.bg) === '#FFFFFF'
        ? 'rgba(255,255,255,0.45)'
        : '#9CA3AF';
    return { bg, sidebar, textColor, subColor };
  }, [isDark, colors.bg, colors.sidebar]);

  const { bg: previewBg, sidebar: previewSidebar, subColor: previewSub } = previewData;

  const handleSave = () => {
    updateProfile({
      primaryColor: colors.primary,
      accentColor: colors.accent,
      sidebarColor: colors.sidebar,
      backgroundColor: colors.bg,
    } as ExtendedProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setColors({ ...DEFAULT_COLORS });
    updateProfile({
      primaryColor: DEFAULT_COLORS.primary,
      accentColor: DEFAULT_COLORS.accent,
      sidebarColor: DEFAULT_COLORS.sidebar,
      backgroundColor: DEFAULT_COLORS.bg,
    } as ExtendedProfile);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-[#112240] p-6 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B2A4A] dark:text-white">Dashboard Appearance</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            Customise colours for the entire platform.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button
            onClick={handleReset}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-white/70 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 rounded-xl transition-all"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            onClick={handleSave}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: saved ? '#10B981' : colors.primary }}
          >
            <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6 bg-white dark:bg-[#112240] p-6 rounded-2xl border border-slate-100 dark:border-white/10 h-fit">
          <AdvancedColorPicker
            label="Primary Colour"
            value={colors.primary}
            onChange={(v) => setColors((c) => ({ ...c, primary: v }))}
          />
          <AdvancedColorPicker
            label="Accent Colour"
            value={colors.accent}
            onChange={(v) => setColors((c) => ({ ...c, accent: v }))}
          />
          <AdvancedColorPicker
            label="Sidebar Background"
            value={colors.sidebar}
            onChange={(v) => setColors((c) => ({ ...c, sidebar: v }))}
          />
          <AdvancedColorPicker
            label="Main Background"
            value={colors.bg}
            onChange={(v) => setColors((c) => ({ ...c, bg: v }))}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mb-3">
              Interface Mode
            </p>
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Moon size={16} className="text-indigo-400" />
                ) : (
                  <Sun size={16} className="text-amber-400" />
                )}
                <span className="text-sm font-semibold text-[#0B2A4A] dark:text-white">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div
                className="relative w-10 h-5 rounded-full transition-colors duration-300"
                style={{ backgroundColor: isDark ? colors.primary : '#E5E7EB' }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                  style={{ left: isDark ? '22px' : '2px' }}
                />
              </div>
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-[#112240] p-6 rounded-2xl border border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">
              Live Preview
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold bg-green-50 text-green-600 border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
            </div>
          </div>

          <div
            className="rounded-xl border border-slate-200 overflow-hidden flex h-[350px] w-full transition-colors duration-300"
            style={{ backgroundColor: previewBg }}
          >
            <div
              className="hidden sm:flex flex-col w-32 md:w-40 h-full shrink-0 transition-colors duration-300"
              style={{ backgroundColor: previewSidebar }}
            >
              <div className="px-4 py-4 border-b border-white/10">
                <div className="h-3 w-20 rounded-full bg-white/30" />
              </div>
              <div className="p-3 space-y-1.5 flex-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5"
                    style={{
                      backgroundColor: i === 1 ? 'rgba(0,0,0,0.1)' : 'transparent',
                      borderRadius: i === 1 ? '0px' : '8px',
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: i === 1 ? colors.accent : '#0B2A4A' }}
                    />
                    <div
                      className="h-1.5 rounded-full flex-1"
                      style={{ backgroundColor: i === 1 ? colors.accent : '#0B2A4A' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                className="px-4 py-2.5 border-b flex items-center justify-between shrink-0"
                style={{
                  backgroundColor: isDark ? '#112240' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                }}
              >
                <div className="h-2 w-20 rounded-full" style={{ backgroundColor: previewSub }} />
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: previewSub + '50' }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                </div>
              </div>
              <div className="flex-1 p-4 md:p-5 space-y-3 overflow-hidden">
                <div
                  className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{
                    background: `linear-gradient(120deg, ${colors.primary} 0%, ${colors.primary}CC 100%)`,
                  }}
                >
                  <div className="space-y-1">
                    <div className="h-1.5 w-16 rounded-full bg-white/30" />
                    <div className="h-2.5 w-24 rounded-full bg-white/70" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[colors.primary, colors.accent, colors.primary, colors.accent].map((c, i) => (
                    <div
                      key={i}
                      className="rounded-lg p-2.5 flex flex-col gap-1.5"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB'}`,
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div
                          className="h-1.5 w-8 rounded-full"
                          style={{ backgroundColor: previewSub + '60' }}
                        />
                        <div
                          className="w-4 h-4 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: `${c}20` }}
                        >
                          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: c }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
