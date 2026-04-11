'use client';

import { useState, useCallback, useEffect, useRef, startTransition } from 'react';
import { Save, RotateCcw, Moon, Sun } from 'lucide-react';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import PaletteGrid from '@/components/secretary/settings/PaletteGrid';
import type { Palette, PaletteGridCustomColors } from '@/components/secretary/settings/PaletteGrid';
import { toast } from 'sonner';

const DARK_DEFAULTS = {
  primary: '#1A3F6B',
  accent: '#2FC4B2',
  sidebar: '#0D1F36',
  topbar: '#0D1F36',
  bg: '#0A1628',
};
const LIGHT_DEFAULTS = {
  primary: '#0B2A4A',
  accent: '#2FC4B2',
  sidebar: '#FFFFFF',
  topbar: '#FFFFFF',
  bg: '#F5F7FA',
};

type LightColors = { primary: string; accent: string; sidebar: string; topbar: string; bg: string };
type DarkColors = typeof DARK_DEFAULTS;

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) || 0,
    g: parseInt(h.substring(2, 4), 16) || 0,
    b: parseInt(h.substring(4, 6), 16) || 0,
  };
}

function autoText(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

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
      type="button"
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

function DashboardPreview({
  light,
  dark,
  isDark,
}: {
  light: LightColors;
  dark: DarkColors;
  isDark: boolean;
}) {
  const c = isDark ? dark : light;
  const topbarBg = isDark ? dark.topbar : light.topbar;
  const sidebarText = autoText(c.sidebar);
  const topbarText = autoText(topbarBg);
  const primaryText = autoText(c.primary);
  const bgText = autoText(c.bg);
  const borderCol = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const cardBg = isDark ? `${c.primary}22` : '#FFFFFF';
  const NAV = ['Dashboard', 'Income', 'Expenses', 'Reports', 'Settings'];

  return (
    <div
      className="rounded-xl border overflow-hidden flex w-full"
      style={{ backgroundColor: c.bg, borderColor: borderCol, height: 'clamp(220px,35vw,320px)' }}
    >
      {/* Sidebar */}
      <div
        className="hidden sm:flex flex-col shrink-0 h-full"
        style={{ backgroundColor: c.sidebar, width: 'clamp(88px,18%,140px)' }}
      >
        <div
          className="px-3 py-3 flex items-center gap-1.5"
          style={{ borderBottom: `1px solid ${sidebarText}15` }}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${c.primary}30` }}
          >
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.primary }} />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div
              className="h-1.5 w-full rounded-full"
              style={{ backgroundColor: `${sidebarText}45` }}
            />
            <div
              className="h-1 w-3/4 rounded-full"
              style={{ backgroundColor: `${sidebarText}22` }}
            />
          </div>
        </div>
        <div className="p-1.5 space-y-0.5 flex-1">
          {NAV.map((label, i) => {
            const a = i === 0;
            return (
              <div
                key={label}
                className="flex items-center gap-1.5 px-1.5 py-1.5"
                style={{
                  backgroundColor: a ? c.primary : 'transparent',
                  borderLeft: `2px solid ${a ? c.accent : 'transparent'}`,
                  borderRadius: a ? '0 4px 4px 0' : '4px',
                }}
              >
                <div
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: a ? c.accent : `${sidebarText}45` }}
                />
                <div
                  className="h-1 rounded-full flex-1"
                  style={{ backgroundColor: a ? `${primaryText}75` : `${sidebarText}30` }}
                />
              </div>
            );
          })}
        </div>
        <div
          className="p-2 flex items-center gap-1.5"
          style={{ borderTop: `1px solid ${sidebarText}15` }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: c.accent,
              fontSize: '7px',
              fontWeight: 800,
              color: autoText(c.accent),
            }}
          >
            T
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div
              className="h-1 w-3/4 rounded-full"
              style={{ backgroundColor: `${sidebarText}55` }}
            />
            <div
              className="h-0.5 w-1/2 rounded-full"
              style={{ backgroundColor: `${sidebarText}25` }}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div
          className="px-3 py-2 flex items-center justify-between shrink-0"
          style={{ backgroundColor: topbarBg, borderBottom: `1px solid ${borderCol}` }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ backgroundColor: `${c.primary}20` }}
            >
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: c.primary }} />
            </div>
            <div
              className="h-1.5 w-14 rounded-full"
              style={{ backgroundColor: `${topbarText}25` }}
            />
          </div>
          <div
            className="relative"
            style={{
              width: '22px',
              height: '12px',
              borderRadius: '6px',
              backgroundColor: isDark ? c.accent : 'rgba(0,0,0,0.15)',
            }}
          >
            <div
              className="absolute bg-white rounded-full shadow"
              style={{
                top: '1px',
                width: '10px',
                height: '10px',
                left: isDark ? '11px' : '1px',
                transition: 'left 0.25s ease',
              }}
            />
          </div>
        </div>
        <div className="flex-1 p-2.5 space-y-2 overflow-hidden" style={{ backgroundColor: c.bg }}>
          <div
            className="rounded-lg px-3 py-2"
            style={{ background: `linear-gradient(120deg,${c.primary} 0%,${c.accent}88 100%)` }}
          >
            <div className="space-y-1">
              <div className="h-1 w-12 rounded-full bg-white/30" />
              <div className="h-2 w-16 rounded-full bg-white/70" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[c.primary, c.accent, c.primary, c.accent].map((col, i) => (
              <div
                key={i}
                className="rounded-md p-2 space-y-1.5"
                style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}` }}
              >
                <div className="flex justify-between items-start">
                  <div
                    className="h-1 w-5 rounded-full"
                    style={{ backgroundColor: `${bgText}18` }}
                  />
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: `${col}28` }}>
                    <div
                      className="w-1.5 h-1.5 m-auto mt-0.5 rounded-sm"
                      style={{ backgroundColor: col }}
                    />
                  </div>
                </div>
                <div
                  className="h-1.5 w-8 rounded-full"
                  style={{ backgroundColor: `${bgText}30` }}
                />
                <div
                  className="h-0.5 rounded-full"
                  style={{ backgroundColor: `${col}45`, width: `${50 + i * 12}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ColorThemeTab() {
  const { profile, updateProfile, toggleDarkMode, isReady } = useTreasuryProfile();
  const isDark = isReady ? profile.darkMode : false;
  const initialisedRef = useRef(false);

  const [light, setLight] = useState<LightColors>(LIGHT_DEFAULTS);
  const [dark, setDark] = useState<DarkColors>(DARK_DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isReady || initialisedRef.current) {
      return;
    }
    initialisedRef.current = true;

    startTransition(() => {
      setLight({
        primary: profile.primaryColor || LIGHT_DEFAULTS.primary,
        accent: profile.accentColor || LIGHT_DEFAULTS.accent,
        sidebar: profile.sidebarColor || LIGHT_DEFAULTS.sidebar,
        topbar: profile.topbarColor || LIGHT_DEFAULTS.topbar,
        bg: profile.backgroundColor || LIGHT_DEFAULTS.bg,
      });
      setDark({
        primary: profile.darkPrimaryColor || DARK_DEFAULTS.primary,
        accent: profile.darkAccentColor || DARK_DEFAULTS.accent,
        sidebar: profile.darkSidebarColor || DARK_DEFAULTS.sidebar,
        topbar: profile.darkTopbarColor || DARK_DEFAULTS.topbar,
        bg: profile.darkBackgroundColor || DARK_DEFAULTS.bg,
      });
    });
  }, [
    isReady,
    profile.primaryColor,
    profile.accentColor,
    profile.sidebarColor,
    profile.topbarColor,
    profile.backgroundColor,
    profile.darkPrimaryColor,
    profile.darkAccentColor,
    profile.darkSidebarColor,
    profile.darkTopbarColor,
    profile.darkBackgroundColor,
  ]);

  const activeColors = isDark ? dark : light;

  const handlePalette = (p: Palette) =>
    setLight({
      primary: p.primary,
      accent: p.accent,
      sidebar: p.sidebar,
      topbar: p.topbar,
      bg: p.bg,
    });

  const handleCustomChange = (key: keyof PaletteGridCustomColors, value: string) => {
    if (isDark) {
      setDark((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'sidebar' && prev.topbar === prev.sidebar) {
          next.topbar = value;
        }
        return next;
      });
    } else {
      setLight((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'sidebar' && prev.topbar === prev.sidebar) {
          next.topbar = value;
        }
        return next;
      });
    }
  };

  const handleSave = useCallback(() => {
    updateProfile({
      primaryColor: light.primary,
      accentColor: light.accent,
      sidebarColor: light.sidebar,
      topbarColor: light.topbar,
      backgroundColor: light.bg,
      darkPrimaryColor: dark.primary,
      darkAccentColor: dark.accent,
      darkSidebarColor: dark.sidebar,
      darkTopbarColor: dark.topbar,
      darkBackgroundColor: dark.bg,
    });
    setSaved(true);
    toast.success('Theme saved!', { description: 'Treasury theme updated.' });
    setTimeout(() => setSaved(false), 2000);
  }, [light, dark, updateProfile]);

  const handleReset = useCallback(() => {
    setLight({ ...LIGHT_DEFAULTS });
    setDark({ ...DARK_DEFAULTS });
    updateProfile({
      primaryColor: LIGHT_DEFAULTS.primary,
      accentColor: LIGHT_DEFAULTS.accent,
      sidebarColor: LIGHT_DEFAULTS.sidebar,
      topbarColor: LIGHT_DEFAULTS.topbar,
      backgroundColor: LIGHT_DEFAULTS.bg,
      darkPrimaryColor: DARK_DEFAULTS.primary,
      darkAccentColor: DARK_DEFAULTS.accent,
      darkSidebarColor: DARK_DEFAULTS.sidebar,
      darkTopbarColor: DARK_DEFAULTS.topbar,
      darkBackgroundColor: DARK_DEFAULTS.bg,
    });
    toast.info('Theme reset to Default.');
  }, [updateProfile]);

  const currentCustom: PaletteGridCustomColors = isDark
    ? {
        primary: dark.primary,
        accent: dark.accent,
        sidebar: dark.sidebar,
        topbar: dark.topbar,
        bg: dark.bg,
      }
    : {
        primary: light.primary,
        accent: light.accent,
        sidebar: light.sidebar,
        topbar: light.topbar,
        bg: light.bg,
      };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-5 sm:p-6 rounded-2xl border border-border shadow-sm gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Dashboard Appearance</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {isDark
              ? '🌙 Dark mode — its own independent palette.'
              : '☀️ Light mode — choose a palette or customise each colour.'}
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-muted-foreground bg-muted/30 hover:bg-muted/50 rounded-xl transition-all"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: saved ? '#10B981' : activeColors.primary }}
          >
            <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="p-2 rounded-xl flex-shrink-0"
            style={{ backgroundColor: isDark ? `${dark.accent}18` : `${light.primary}12` }}
          >
            {isDark ? (
              <Moon size={16} style={{ color: dark.accent }} />
            ) : (
              <Sun size={16} style={{ color: light.primary }} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">
              {isDark ? 'Dark Mode Active' : 'Light Mode Active'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isDark
                ? 'Dark mode has its own separate palette.'
                : 'Select a palette, then fine-tune in the Custom tab.'}
            </p>
          </div>
        </div>
        <DarkModePill
          isDark={isDark}
          onToggle={toggleDarkMode}
          accentColor={isDark ? dark.accent : light.accent}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-4 bg-card p-5 sm:p-6 rounded-2xl border border-border">
          <PaletteGrid
            selected={{
              primary: isDark ? dark.primary : light.primary,
              accent: isDark ? dark.accent : light.accent,
            }}
            onSelect={handlePalette}
            customColors={currentCustom}
            onCustomChange={handleCustomChange}
          />
        </div>
        <div className="lg:col-span-8 bg-card p-5 sm:p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Live Preview
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isDark ? '🌙 Dark palette' : '☀️ Light palette'} · updates instantly
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold bg-green-50 text-green-600 border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
            </div>
          </div>
          <DashboardPreview light={light} dark={dark} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
