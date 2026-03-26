'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Save, Sun, Moon, RotateCcw, Loader2 } from 'lucide-react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts';
import { getChurchId, updateChurch } from '@/lib/settingsApi';

// ── Constants ──────────────────────────────────────────────────────────────────
const DEFAULT_COLORS = {
  primary: '#0B2A4A',
  accent: '#2FC4B2',
  sidebar: '#0B2A4A',
  bg: '#F8FAFC',
};

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

// Darken a hex colour by `amount` (0–1) for hover/active states in the preview
const darkenHex = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);
  const d = 1 - amount;
  const toHex = (v: number) =>
    Math.round(v * d)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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
          style={{ backgroundColor: value, color: textColor, borderColor: 'rgba(0,0,0,0.10)' }}
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

// ── Dashboard Preview ──────────────────────────────────────────────────────────
// Renders a faithful mini-replica of the actual admin layout using the live
// colour values. Dark mode no longer overrides the chosen colours — instead
// it applies a dark tint on top of the chosen colours so the user can see
// exactly what their palette will look like in both modes.
const DashboardPreview = ({
  colors,
  isDark,
}: {
  colors: { primary: string; accent: string; sidebar: string; bg: string };
  isDark: boolean;
}) => {
  // ── Derive preview tokens from the ACTUAL chosen colours ────────────────
  //
  // Light mode: use colours as-is.
  // Dark mode:  darken the bg and sidebar by 30–40% so the preview reflects
  //             how dark mode blends with the chosen palette — but the hue
  //             still comes from the user's chosen colours, not hardcoded values.
  //
  const previewBg = isDark ? darkenHex(colors.bg, 0.45) : colors.bg;
  const previewSidebar = isDark ? darkenHex(colors.sidebar, 0.35) : colors.sidebar;
  const previewNavbar = isDark ? darkenHex(colors.bg, 0.38) : '#FFFFFF';
  const previewCard = isDark ? darkenHex(colors.bg, 0.3) : '#FFFFFF';
  const previewBorder = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';

  const sidebarText = getBestTextColor(previewSidebar);
  const bgText = getBestTextColor(previewBg);

  const NAV_ITEMS = ['Dashboard', 'Members', 'Treasury', 'Reports', 'Settings'];

  return (
    <div
      className="rounded-xl border overflow-hidden flex h-[360px] w-full transition-all duration-300"
      style={{ backgroundColor: previewBg, borderColor: previewBorder }}
    >
      {/* ── Sidebar ── */}
      <div
        className="hidden sm:flex flex-col w-36 md:w-44 h-full shrink-0 transition-all duration-300"
        style={{ backgroundColor: previewSidebar }}
      >
        {/* Logo area */}
        <div
          className="px-4 py-4 flex items-center gap-2"
          style={{
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${colors.primary}30` }}
          >
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.primary }} />
          </div>
          <div className="space-y-1 flex-1">
            <div
              className="h-1.5 w-16 rounded-full"
              style={{ backgroundColor: `${sidebarText}50` }}
            />
            <div
              className="h-1 w-10 rounded-full"
              style={{ backgroundColor: `${sidebarText}25` }}
            />
          </div>
        </div>

        {/* Nav items */}
        <div className="p-2 space-y-0.5 flex-1">
          {NAV_ITEMS.map((label, i) => {
            const active = i === 0;
            return (
              <div
                key={label}
                className="flex items-center gap-2 px-2 py-2 transition-colors"
                style={{
                  backgroundColor: active ? colors.primary : 'transparent',
                  borderLeft: `3px solid ${active ? colors.accent : 'transparent'}`,
                  borderRadius: active ? '0 6px 6px 0' : '6px',
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: active ? '#FFFFFF' : `${sidebarText}50` }}
                />
                <div
                  className="h-1.5 rounded-full flex-1"
                  style={{ backgroundColor: active ? 'rgba(255,255,255,0.8)' : `${sidebarText}35` }}
                />
                {active && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: colors.accent }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* User footer */}
        <div
          className="p-3 flex items-center gap-2"
          style={{
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
          }}
        >
          <div
            className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white"
            style={{ backgroundColor: colors.accent, fontSize: '8px', fontWeight: 800 }}
          >
            AD
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div
              className="h-1.5 w-12 rounded-full"
              style={{ backgroundColor: `${sidebarText}60` }}
            />
            <div className="h-1 w-8 rounded-full" style={{ backgroundColor: `${sidebarText}30` }} />
          </div>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <div
          className="px-4 py-2.5 flex items-center justify-between shrink-0"
          style={{ backgroundColor: previewNavbar, borderBottom: `1px solid ${previewBorder}` }}
        >
          <div className="h-2 w-20 rounded-full" style={{ backgroundColor: `${bgText}25` }} />
          <div className="flex items-center gap-2">
            {/* Dark mode toggle replica */}
            <div
              className="w-8 h-4 rounded-full flex items-center px-0.5"
              style={{ backgroundColor: isDark ? colors.primary : '#E5E7EB' }}
            >
              <div
                className="w-3 h-3 rounded-full bg-white shadow transition-all duration-300"
                style={{ marginLeft: isDark ? 'auto' : '0' }}
              />
            </div>
            {/* Bell */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${bgText}08` }}
            >
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `${bgText}40` }} />
            </div>
            {/* Avatar */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: colors.primary, fontSize: '7px', fontWeight: 800 }}
            >
              AD
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-3 md:p-4 space-y-3 overflow-hidden">
          {/* Hero / stat banner */}
          <div
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{
              background: `linear-gradient(120deg, ${colors.primary} 0%, ${darkenHex(colors.primary, 0.2)} 100%)`,
            }}
          >
            <div className="space-y-1.5">
              <div className="h-1.5 w-14 rounded-full bg-white/30" />
              <div className="h-2.5 w-20 rounded-full bg-white/70" />
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <div className="w-4 h-4 rounded-sm bg-white/60" />
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[colors.primary, colors.accent, colors.primary, colors.accent].map((c, i) => (
              <div
                key={i}
                className="rounded-lg p-2.5 space-y-2"
                style={{
                  backgroundColor: previewCard,
                  border: `1px solid ${previewBorder}`,
                }}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="h-1.5 w-8 rounded-full"
                    style={{ backgroundColor: `${bgText}20` }}
                  />
                  <div
                    className="w-4 h-4 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `${c}20` }}
                  >
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: c }} />
                  </div>
                </div>
                <div className="h-2 w-12 rounded-full" style={{ backgroundColor: `${bgText}35` }} />
                <div
                  className="h-1 rounded-full"
                  style={{ backgroundColor: `${c}30`, width: `${50 + i * 12}%` }}
                />
              </div>
            ))}
          </div>

          {/* Accent bar */}
          <div
            className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{
              backgroundColor: `${colors.accent}15`,
              border: `1px solid ${colors.accent}30`,
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
            <div
              className="h-1.5 w-24 rounded-full"
              style={{ backgroundColor: `${colors.accent}50` }}
            />
            <div
              className="ml-auto h-1.5 w-12 rounded-full"
              style={{ backgroundColor: `${colors.accent}30` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ColorThemeSettings() {
  const { profile, updateProfile, toggleDarkMode } = useChurchProfile();

  // Derive initial colours directly from the profile that is already in the
  // context. By the time this component mounts, ChurchProfileProvider has
  // already read localStorage synchronously via readStoredProfile(), so
  // profile values are final — no effect + setState sync needed.
  const [colors, setColors] = useState(() => ({
    primary: profile.primaryColor || DEFAULT_COLORS.primary,
    accent: profile.accentColor || DEFAULT_COLORS.accent,
    sidebar: profile.sidebarColor || DEFAULT_COLORS.sidebar,
    bg: profile.backgroundColor || DEFAULT_COLORS.bg,
  }));

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDark = profile.darkMode ?? false;

  const handleSave = useCallback(async () => {
    updateProfile({
      primaryColor: colors.primary,
      accentColor: colors.accent,
      sidebarColor: colors.sidebar,
      backgroundColor: colors.bg,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    const churchId = getChurchId();
    if (churchId) {
      setSaving(true);
      try {
        await updateChurch(churchId, {
          primary_color: colors.primary,
          accent_color: colors.accent,
          sidebar_color: colors.sidebar,
          background_color: colors.bg,
          dark_mode: isDark,
        });
      } catch {
        /* persist locally even if API fails */
      } finally {
        setSaving(false);
      }
    }
  }, [colors, updateProfile, isDark]);

  const handleReset = useCallback(async () => {
    setColors({ ...DEFAULT_COLORS });
    updateProfile({
      primaryColor: DEFAULT_COLORS.primary,
      accentColor: DEFAULT_COLORS.accent,
      sidebarColor: DEFAULT_COLORS.sidebar,
      backgroundColor: DEFAULT_COLORS.bg,
    });
    const churchId = getChurchId();
    if (churchId) {
      try {
        await updateChurch(churchId, {
          primary_color: DEFAULT_COLORS.primary,
          accent_color: DEFAULT_COLORS.accent,
          sidebar_color: DEFAULT_COLORS.sidebar,
          background_color: DEFAULT_COLORS.bg,
        });
      } catch {
        /* ignore */
      }
    }
  }, [updateProfile]);

  // Memoize so the preview only re-renders when colours or dark mode actually change
  const previewColors = useMemo(() => colors, [colors]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-[#253347] p-6 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B2A4A] dark:text-white">Dashboard Appearance</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            Customise colours for the entire platform. Preview updates live.
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
            disabled={saving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70"
            style={{ backgroundColor: saved ? '#10B981' : colors.primary }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{' '}
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left: colour pickers + mode toggle ── */}
        <div className="lg:col-span-4 space-y-6 bg-white dark:bg-[#253347] p-6 rounded-2xl border border-slate-100 dark:border-white/10 h-fit">
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

            {/* Helpful note so users understand preview intent */}
            <p className="mt-2 text-[10px] text-slate-400 dark:text-white/25 leading-relaxed">
              {isDark
                ? 'Dark mode darkens your chosen colours. The preview shows how your palette looks at night.'
                : 'Light mode uses your colours as-is. Toggle dark mode above to preview the night palette.'}
            </p>
          </div>
        </div>

        {/* ── Right: live preview ── */}
        <div className="lg:col-span-8 bg-white dark:bg-[#253347] p-6 rounded-2xl border border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest">
                Live Preview
              </h3>
              <p className="text-[10px] text-slate-300 dark:text-white/20 mt-0.5">
                {isDark ? 'Dark mode' : 'Light mode'} · colours update as you pick
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold bg-green-50 text-green-600 border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
            </div>
          </div>

          <DashboardPreview colors={previewColors} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
