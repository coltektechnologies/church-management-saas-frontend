'use client';

import { useState } from 'react';
import { Paintbrush2, LayoutGrid, Check, ChevronDown } from 'lucide-react';

export interface Palette {
  name: string;
  primary: string;
  accent: string;
  sidebar: string;
  topbar: string;
  bg: string;
}

// ── PALETTES ──────────────────────────────────────────────────────────────────
export const MAIN_PALETTES: Palette[] = [
  // Default
  {
    name: 'Default',
    primary: '#0B2A4A',
    accent: '#2FC4B2',
    sidebar: '#FFFFFF',
    topbar: '#FFFFFF',
    bg: '#F5F7FA',
  },
  // Warm
  {
    name: 'Warm Gold',
    primary: '#78350F',
    accent: '#F59E0B',
    sidebar: '#FEF3C7',
    topbar: '#FFFFFF',
    bg: '#FFFBEB',
  },
  {
    name: 'Sunset Orange',
    primary: '#7C2D12',
    accent: '#F97316',
    sidebar: '#FFEDD5',
    topbar: '#FFFFFF',
    bg: '#FFF7ED',
  },
  {
    name: 'Crimson Bold',
    primary: '#991B1B',
    accent: '#EF4444',
    sidebar: '#FEE2E2',
    topbar: '#FFFFFF',
    bg: '#FEF2F2',
  },
  {
    name: 'Rose Pink',
    primary: '#881337',
    accent: '#F43F5E',
    sidebar: '#FFE4E6',
    topbar: '#FFFFFF',
    bg: '#FFF1F2',
  },
  {
    name: 'Deep Burgundy',
    primary: '#4C0519',
    accent: '#E11D48',
    sidebar: '#4C0519',
    topbar: '#4C0519',
    bg: '#FFF1F2',
  },
  {
    name: 'Amber Glow',
    primary: '#92400E',
    accent: '#FBBF24',
    sidebar: '#FFFFFF',
    topbar: '#92400E',
    bg: '#FFFBEB',
  },
  // Cool
  {
    name: 'Ocean Navy',
    primary: '#0B2A4A',
    accent: '#2FC4B2',
    sidebar: '#0B2A4A',
    topbar: '#0B2A4A',
    bg: '#F5F7FA',
  },
  {
    name: 'Royal Blue',
    primary: '#1E3A5F',
    accent: '#60A5FA',
    sidebar: '#1E3A5F',
    topbar: '#FFFFFF',
    bg: '#F0F4F8',
  },
  {
    name: 'Indigo Night',
    primary: '#312E81',
    accent: '#818CF8',
    sidebar: '#1E1B4B',
    topbar: '#1E1B4B',
    bg: '#EEF2FF',
  },
  {
    name: 'Berry Purple',
    primary: '#3B0764',
    accent: '#C084FC',
    sidebar: '#3B0764',
    topbar: '#3B0764',
    bg: '#FAF5FF',
  },
  {
    name: 'Sky Breeze',
    primary: '#0369A1',
    accent: '#38BDF8',
    sidebar: '#E0F2FE',
    topbar: '#FFFFFF',
    bg: '#F0F9FF',
  },
  {
    name: 'Cobalt Sharp',
    primary: '#1D4ED8',
    accent: '#93C5FD',
    sidebar: '#1D4ED8',
    topbar: '#1E40AF',
    bg: '#EFF6FF',
  },
  {
    name: 'Midnight Blue',
    primary: '#0F172A',
    accent: '#38BDF8',
    sidebar: '#0F172A',
    topbar: '#0F172A',
    bg: '#F8FAFC',
  },
  // Nature
  {
    name: 'Forest Green',
    primary: '#1B4332',
    accent: '#34D399',
    sidebar: '#1B4332',
    topbar: '#FFFFFF',
    bg: '#F0FFF4',
  },
  {
    name: 'Teal Fresh',
    primary: '#134E4A',
    accent: '#2DD4BF',
    sidebar: '#CCFBF1',
    topbar: '#FFFFFF',
    bg: '#F0FDFA',
  },
  {
    name: 'Emerald Classic',
    primary: '#064E3B',
    accent: '#10B981',
    sidebar: '#064E3B',
    topbar: '#064E3B',
    bg: '#ECFDF5',
  },
  {
    name: 'Sage Light',
    primary: '#3F6212',
    accent: '#84CC16',
    sidebar: '#ECFCCB',
    topbar: '#FFFFFF',
    bg: '#F7FEE7',
  },
  {
    name: 'Olive Earthy',
    primary: '#365314',
    accent: '#A3E635',
    sidebar: '#365314',
    topbar: '#365314',
    bg: '#F7FEE7',
  },
  {
    name: 'Jade Deep',
    primary: '#065F46',
    accent: '#6EE7B7',
    sidebar: '#065F46',
    topbar: '#FFFFFF',
    bg: '#ECFDF5',
  },
  // Pastel
  {
    name: 'Lavender Soft',
    primary: '#5B21B6',
    accent: '#A78BFA',
    sidebar: '#EDE9FE',
    topbar: '#FFFFFF',
    bg: '#F5F3FF',
  },
  {
    name: 'Dusty Rose',
    primary: '#9D174D',
    accent: '#F472B6',
    sidebar: '#FCE7F3',
    topbar: '#FFFFFF',
    bg: '#FDF2F8',
  },
  {
    name: 'Peach Blush',
    primary: '#C2410C',
    accent: '#FB923C',
    sidebar: '#FFEDD5',
    topbar: '#FFFFFF',
    bg: '#FFF7ED',
  },
  {
    name: 'Mint Pastel',
    primary: '#065F46',
    accent: '#6EE7B7',
    sidebar: '#D1FAE5',
    topbar: '#FFFFFF',
    bg: '#F0FFF4',
  },
  {
    name: 'Baby Blue',
    primary: '#1E40AF',
    accent: '#93C5FD',
    sidebar: '#DBEAFE',
    topbar: '#FFFFFF',
    bg: '#EFF6FF',
  },
  {
    name: 'Lilac Dream',
    primary: '#6D28D9',
    accent: '#DDD6FE',
    sidebar: '#EDE9FE',
    topbar: '#FFFFFF',
    bg: '#F5F3FF',
  },
  // Bold
  {
    name: 'Slate Modern',
    primary: '#1E293B',
    accent: '#64748B',
    sidebar: '#F8FAFC',
    topbar: '#1E293B',
    bg: '#F8FAFC',
  },
  {
    name: 'Charcoal Pro',
    primary: '#111827',
    accent: '#6B7280',
    sidebar: '#F9FAFB',
    topbar: '#111827',
    bg: '#F3F4F6',
  },
  {
    name: 'Deep Ocean',
    primary: '#164E63',
    accent: '#22D3EE',
    sidebar: '#CFFAFE',
    topbar: '#164E63',
    bg: '#F0FDFF',
  },
  {
    name: 'Bold Purple Top',
    primary: '#4C1D95',
    accent: '#8B5CF6',
    sidebar: '#FFFFFF',
    topbar: '#4C1D95',
    bg: '#F5F3FF',
  },
  {
    name: 'Bold Red Top',
    primary: '#991B1B',
    accent: '#FCA5A5',
    sidebar: '#FFFFFF',
    topbar: '#991B1B',
    bg: '#FEF2F2',
  },
  {
    name: 'Bold Teal Top',
    primary: '#134E4A',
    accent: '#5EEAD4',
    sidebar: '#FFFFFF',
    topbar: '#134E4A',
    bg: '#F0FDFA',
  },
  // Minimal
  {
    name: 'Clean White',
    primary: '#0B2A4A',
    accent: '#2FC4B2',
    sidebar: '#FFFFFF',
    topbar: '#FFFFFF',
    bg: '#FFFFFF',
  },
  {
    name: 'Soft Grey',
    primary: '#374151',
    accent: '#9CA3AF',
    sidebar: '#F9FAFB',
    topbar: '#FFFFFF',
    bg: '#F3F4F6',
  },
  {
    name: 'Warm Neutral',
    primary: '#44403C',
    accent: '#A8A29E',
    sidebar: '#FAFAF9',
    topbar: '#FFFFFF',
    bg: '#F5F5F4',
  },
  {
    name: 'Ink Black',
    primary: '#030712',
    accent: '#6B7280',
    sidebar: '#111827',
    topbar: '#030712',
    bg: '#F9FAFB',
  },
];

export const MORE_PALETTES: Palette[] = [];
export const ALL_PALETTES = [...MAIN_PALETTES, ...MORE_PALETTES];

// ── Category index ranges ─────────────────────────────────────────────────────
const CATEGORIES: { label: string; range: [number, number] }[] = [
  { label: 'Default', range: [0, 1] },
  { label: 'Warm', range: [1, 7] },
  { label: 'Cool', range: [7, 14] },
  { label: 'Nature', range: [14, 20] },
  { label: 'Pastel', range: [20, 26] },
  { label: 'Bold', range: [26, 32] },
  { label: 'Minimal', range: [32, 36] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#111827' : '#FFFFFF';
}

// ── Palette row — single item per row, tall narrow swatch ─────────────────────
function PaletteRow({
  p,
  selected,
  onSelect,
}: {
  p: Palette;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={p.name}
      className="w-full flex items-center gap-3 px-2 py-1.5 rounded-xl transition-all duration-150 focus:outline-none group"
      style={{
        backgroundColor: selected ? `${p.accent}10` : 'transparent',
        border: selected ? `1.5px solid ${p.accent}40` : '1.5px solid transparent',
      }}
    >
      {/* Tall narrow swatch — sidebar | topbar | accent | bg stacked vertically */}
      <div
        className="flex-shrink-0 rounded-lg overflow-hidden"
        style={{
          width: '42px',
          height: '36px',
          boxShadow: selected
            ? `0 0 0 2px ${p.accent}, 0 2px 8px ${p.accent}30`
            : '0 1px 3px rgba(0,0,0,0.12)',
          border: selected ? 'none' : '1px solid rgba(0,0,0,0.07)',
          flexShrink: 0,
        }}
      >
        {/* Left half: sidebar */}
        {/* Right half: top=topbar, middle=accent, bottom=bg */}
        <div className="flex h-full">
          <div style={{ width: '40%', backgroundColor: p.sidebar }} />
          <div className="flex flex-col" style={{ flex: 1 }}>
            <div style={{ flex: 1, backgroundColor: p.topbar }} />
            <div style={{ height: '10px', backgroundColor: p.accent }} />
            <div style={{ flex: 1, backgroundColor: p.bg }} />
          </div>
        </div>
      </div>

      {/* Name + hex hint */}
      <div className="flex-1 min-w-0 text-left">
        <p
          className="text-[12px] font-semibold truncate leading-tight"
          style={{ color: selected ? p.accent : '#374151' }}
        >
          {p.name}
        </p>
        <p className="text-[9px] text-gray-400 mt-0.5 truncate">
          {p.primary} · {p.accent}
        </p>
      </div>

      {/* Check */}
      {selected && (
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: p.accent }}
        >
          <Check size={9} color="#fff" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ── Collapsible category ──────────────────────────────────────────────────────
function Category({
  label,
  palettes,
  selected,
  onSelect,
}: {
  label: string;
  palettes: Palette[];
  selected: { primary: string; accent: string };
  onSelect: (p: Palette) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedPalette =
    palettes.find((p) => p.primary === selected.primary && p.accent === selected.accent) ?? null;
  const hasSelection = selectedPalette !== null;

  return (
    <div>
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 focus:outline-none"
        style={{
          backgroundColor: hasSelection ? `${selectedPalette.accent}10` : '#F9FAFB',
          border: hasSelection ? `1.5px solid ${selectedPalette.accent}35` : '1.5px solid #E5E7EB',
        }}
      >
        {/* Left: category label + selected badge */}
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 flex-shrink-0">
            {label}
          </p>
          {hasSelection && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full truncate"
              style={{ backgroundColor: selectedPalette.accent, color: '#fff', maxWidth: '90px' }}
            >
              {selectedPalette.name}
            </span>
          )}
        </div>

        {/* Right: mini colour dots + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasSelection && (
            <div className="flex items-center gap-0.5">
              {[
                selectedPalette.sidebar,
                selectedPalette.topbar,
                selectedPalette.accent,
                selectedPalette.bg,
              ].map((col, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: col,
                    border: '1px solid rgba(0,0,0,0.10)',
                  }}
                />
              ))}
            </div>
          )}
          <ChevronDown
            size={12}
            className="text-gray-400"
            style={{
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>

      {/* Single-column palette list */}
      {open && (
        <div className="mt-1 space-y-0.5 px-1">
          {palettes.map((p) => (
            <PaletteRow
              key={p.name}
              p={p}
              selected={selected.primary === p.primary && selected.accent === p.accent}
              onSelect={() => {
                onSelect(p);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Custom colour picker row ───────────────────────────────────────────────────
function ColorRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const textCol = autoText(value);
  return (
    <div className="flex items-center gap-3 py-2.5 px-3">
      <div className="relative shrink-0">
        <div
          className="w-10 h-10 rounded-xl shadow-sm flex items-center justify-center"
          style={{ backgroundColor: value, border: '1.5px solid rgba(0,0,0,0.10)' }}
        >
          <span
            className="text-[7px] font-bold select-none"
            style={{ color: textCol, letterSpacing: '-0.02em' }}
          >
            {value.replace('#', '').toUpperCase()}
          </span>
        </div>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-xl"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800">{label}</p>
        {hint && <p className="text-[10px] text-gray-400 leading-tight">{hint}</p>}
      </div>
      <span
        className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
        style={{
          backgroundColor: `${value}18`,
          color: value,
          border: `1px solid ${value}30`,
        }}
      >
        {value.toUpperCase()}
      </span>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface PaletteGridCustomColors {
  primary: string;
  accent: string;
  sidebar: string;
  topbar: string;
  bg: string;
}

interface PaletteGridProps {
  selected: { primary: string; accent: string };
  onSelect: (p: Palette) => void;
  customColors?: PaletteGridCustomColors;
  onCustomChange?: (key: keyof PaletteGridCustomColors, value: string) => void;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PaletteGrid({
  selected,
  onSelect,
  customColors,
  onCustomChange,
}: PaletteGridProps) {
  const [tab, setTab] = useState<'palettes' | 'custom'>('palettes');

  const TABS = [
    { key: 'palettes' as const, icon: <LayoutGrid size={12} />, label: 'Palettes' },
    { key: 'custom' as const, icon: <Paintbrush2 size={12} />, label: 'Custom' },
  ];

  const CUSTOM_FIELDS: {
    label: string;
    key: keyof PaletteGridCustomColors;
    hint: string;
  }[] = [
    { label: 'Primary colour', key: 'primary', hint: 'Nav highlights, buttons, active states' },
    { label: 'Accent colour', key: 'accent', hint: 'Badges, indicators, focus rings' },
    { label: 'Sidebar bg', key: 'sidebar', hint: 'Left navigation panel' },
    { label: 'Topbar bg', key: 'topbar', hint: 'Top navigation bar' },
    { label: 'Page bg', key: 'bg', hint: 'Main content area background' },
  ];

  const accentCol = selected.accent || '#2FC4B2';

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{ backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB' }}
      >
        {TABS.map(({ key, icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-bold transition-all duration-200 focus:outline-none"
            style={
              tab === key
                ? {
                    backgroundColor: '#FFFFFF',
                    color: accentCol,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                  }
                : { color: '#9CA3AF' }
            }
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* ── PALETTES TAB ── */}
      {tab === 'palettes' && (
        <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '480px' }}>
          {/* Swatch legend */}
          <div
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[9px] font-semibold text-gray-400 mb-1"
            style={{ backgroundColor: '#F9FAFB', border: '1px dashed #E5E7EB' }}
          >
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full inline-block border border-gray-300"
                style={{ backgroundColor: '#94A3B8' }}
              />
              Sidebar
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full inline-block border border-gray-300"
                style={{ backgroundColor: '#64748B' }}
              />
              Topbar
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full inline-block border border-gray-300"
                style={{ backgroundColor: '#334155' }}
              />
              Accent
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full inline-block border border-gray-300"
                style={{ backgroundColor: '#F1F5F9' }}
              />
              Bg
            </span>
          </div>

          {CATEGORIES.map(({ label, range }) => (
            <Category
              key={label}
              label={label}
              palettes={MAIN_PALETTES.slice(range[0], range[1])}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {/* ── CUSTOM TAB ── */}
      {tab === 'custom' && (
        <div className="space-y-4">
          {/* Mini live preview strip */}
          {customColors && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                Preview
              </p>
              <div
                className="w-full rounded-xl overflow-hidden"
                style={{
                  height: '44px',
                  border: '1.5px solid #E5E7EB',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}
              >
                <div className="flex h-full">
                  <div style={{ width: '22%', backgroundColor: customColors.sidebar }} />
                  <div style={{ width: '22%', backgroundColor: customColors.topbar }} />
                  <div style={{ flex: 1, backgroundColor: customColors.accent }} />
                  <div style={{ width: '30%', backgroundColor: customColors.bg }} />
                </div>
              </div>
              <div className="flex justify-between text-[8px] text-gray-400 mt-1 px-0.5">
                <span>Sidebar</span>
                <span>Topbar</span>
                <span>Accent</span>
                <span>Page bg</span>
              </div>
            </div>
          )}

          <p className="text-[10px] text-gray-400 leading-relaxed">
            Click any colour swatch to open the picker. The preview above updates live.
          </p>

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
            {CUSTOM_FIELDS.map(({ label, key, hint }, i) => {
              const value = customColors?.[key] ?? '#CCCCCC';
              return (
                <div key={key} style={{ borderTop: i === 0 ? 'none' : '1px solid #F3F4F6' }}>
                  <ColorRow
                    label={label}
                    value={value}
                    hint={hint}
                    onChange={(v) => onCustomChange?.(key, v)}
                  />
                </div>
              );
            })}
          </div>

          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{
              backgroundColor: `${accentCol}10`,
              border: `1px solid ${accentCol}25`,
            }}
          >
            <span className="text-base shrink-0 mt-0.5">💡</span>
            <p className="text-[10px] leading-relaxed" style={{ color: accentCol }}>
              <strong>Tip:</strong> Pick a palette first, then switch here to fine-tune individual
              colours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
