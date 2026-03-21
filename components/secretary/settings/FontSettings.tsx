'use client';

// FontSettings — Microsoft Office-style font picker.
// Font family: searchable dropdown with live font preview, grouped by category.
// Font size:   dropdown with pixel sizes (like Office's pt size picker).
// Both apply instantly as CSS vars on [data-secretary-theme] so the whole
// secretary layout inherits the change — same as Android system font.

import { useState, useEffect, useCallback, useRef } from 'react';
import { Type, ChevronDown, Search, Check } from 'lucide-react';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';

// ── Font catalogue ─────────────────────────────────────────────────────────
export const FONT_CATALOGUE: { value: string; label: string; category: string }[] = [
  // Modern sans-serif
  { value: 'Inter', label: 'Inter', category: 'Modern' },
  { value: 'Poppins', label: 'Poppins', category: 'Modern' },
  { value: 'DM Sans', label: 'DM Sans', category: 'Modern' },
  { value: 'Nunito', label: 'Nunito', category: 'Modern' },
  { value: 'Outfit', label: 'Outfit', category: 'Modern' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'Modern' },
  // Professional
  { value: 'Roboto', label: 'Roboto', category: 'Professional' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Professional' },
  { value: 'Lato', label: 'Lato', category: 'Professional' },
  { value: 'Noto Sans', label: 'Noto Sans', category: 'Professional' },
  { value: 'Source Sans 3', label: 'Source Sans 3', category: 'Professional' },
  // Editorial serif
  { value: 'Merriweather', label: 'Merriweather', category: 'Editorial' },
  { value: 'Lora', label: 'Lora', category: 'Editorial' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Editorial' },
  // System
  { value: 'Georgia', label: 'Georgia', category: 'System' },
  { value: 'Arial', label: 'Arial', category: 'System' },
  { value: 'Verdana', label: 'Verdana', category: 'System' },
  { value: 'Tahoma', label: 'Tahoma', category: 'System' },
  // Code
  { value: 'Fira Code', label: 'Fira Code', category: 'Code' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Code' },
];

export const FONT_SIZES = [
  { value: '11', label: '11' },
  { value: '12', label: '12' },
  { value: '13', label: '13' },
  { value: '14', label: '14' },
  { value: '15', label: '15' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
  { value: '20', label: '20' },
];

const SYSTEM_FONTS = new Set(['Georgia', 'Arial', 'Verdana', 'Tahoma']);

function buildGoogleFontsUrl() {
  const families = FONT_CATALOGUE.filter((f) => !SYSTEM_FONTS.has(f.value))
    .map((f) => `family=${encodeURIComponent(f.value)}:wght@300;400;500;600;700;800`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function injectGoogleFonts() {
  if (typeof document === 'undefined') {
    return;
  }
  const id = 'secretary-google-fonts';
  if (document.getElementById(id)) {
    return;
  }
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = buildGoogleFontsUrl();
  document.head.appendChild(link);
}

export function applyFontToRoot(family: string, sizePx: string) {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.querySelector('[data-secretary-theme]') as HTMLElement | null;
  if (!root) {
    return;
  }
  root.style.setProperty('--secretary-font-family', `'${family}', system-ui, sans-serif`);
  root.style.setProperty('--secretary-font-size', `${sizePx}px`);
}

// Restore saved font on mount — call in SecretaryShell
export function useApplyFont() {
  const { profile, isReady } = useSecretaryProfile();
  useEffect(() => {
    if (!isReady) {
      return;
    }
    injectGoogleFonts();
    applyFontToRoot(profile.fontFamily || 'Inter', profile.fontSize || '14');
  }, [isReady, profile.fontFamily, profile.fontSize]);
}

// ── Office-style font family dropdown ────────────────────────────────────────
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
      {/* Trigger — looks like Office font box */}
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

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          style={{ maxHeight: '320px', display: 'flex', flexDirection: 'column' }}
        >
          {/* Search box */}
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

          {/* Font list — scrollable, grouped */}
          <div className="overflow-y-auto flex-1">
            {categories.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-4">
                No fonts match "{query}"
              </p>
            ) : (
              categories.map((cat) => (
                <div key={cat}>
                  {/* Category label */}
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

// ── Office-style font size dropdown ──────────────────────────────────────────
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
            const sel = value === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  onChange(s.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors"
                style={{ backgroundColor: sel ? `${accentColor}12` : undefined }}
              >
                <span className="text-sm text-foreground">{s.label}px</span>
                {sel && <Check size={13} style={{ color: accentColor }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main FontSettings component ───────────────────────────────────────────────
interface FontSettingsProps {
  onSave: (fontFamily: string, fontSize: string) => void;
  initialFamily?: string;
  initialSize?: string;
  accentColor?: string;
}

export function FontSettings({
  onSave,
  initialFamily = 'Inter',
  initialSize = '14',
  accentColor = '#2FC4B2',
}: FontSettingsProps) {
  const [family, setFamily] = useState(initialFamily);
  const [size, setSize] = useState(initialSize);

  useEffect(() => {
    injectGoogleFonts();
  }, []);

  // Apply live preview immediately
  useEffect(() => {
    applyFontToRoot(family, size);
  }, [family, size]);

  const handleSave = useCallback(() => {
    applyFontToRoot(family, size);
    onSave(family, size);
  }, [family, size, onSave]);

  const handleReset = () => {
    setFamily('Inter');
    setSize('14');
    applyFontToRoot('Inter', '14');
    onSave('Inter', '14');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
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
            onClick={handleReset}
            className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-white transition-all active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Font family + size on same row — like Office toolbar */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground ml-1">Font Family</p>
          <FontFamilyDropdown value={family} onChange={setFamily} accentColor={accentColor} />
        </div>
        <div className="space-y-1 flex-shrink-0">
          <p className="text-[10px] font-semibold text-muted-foreground ml-1">Size</p>
          <FontSizeDropdown value={size} onChange={setSize} accentColor={accentColor} />
        </div>
      </div>

      {/* Live preview card */}
      <div
        className="p-4 rounded-2xl border border-border bg-muted/5 transition-all duration-200"
        style={{
          fontFamily: `'${family}', system-ui, sans-serif`,
          fontSize: `${size}px`,
          lineHeight: '1.6',
        }}
      >
        <p className="font-bold text-foreground" style={{ fontSize: `${Number(size) + 3}px` }}>
          Dashboard Heading
        </p>
        <p className="text-muted-foreground mt-1">
          The quick brown fox jumps over the lazy dog. 0123456789
        </p>
        <p
          className="font-semibold text-foreground mt-2"
          style={{ fontSize: `${Math.max(10, Number(size) - 1)}px` }}
        >
          Label ·{' '}
          <span className="font-normal text-muted-foreground">Secondary text · ₵1,250.00</span>
        </p>
      </div>
    </div>
  );
}
