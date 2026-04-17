'use client';

/**
 * ColorSeriesPanel.tsx
 * Panel for customising per-series colours with swatches + custom colour picker.
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import type { DropdownOption } from '@/components/treasurydashboard/recordIncome/dropdownOptions';

export const PALETTE = [
  '#2FC4B2', '#0B2A4A', '#E4002B', '#FFB020',
  '#6366F1', '#EC4899', '#14B8A6', '#F97316',
  '#22C55E', '#A855F7', '#EAB308', '#3B82F6',
];

interface ColorSeriesPanelProps {
  selectedTypes:  string[];
  liveTypes:      DropdownOption[];
  seriesColors:   Record<string, string>;
  onColorChange:  (tv: string, color: string) => void;
  onColorReset:   (tv: string, idx: number) => void;
  textColor:      string;
  accentColor:    string;
  borderColor:    string;
  isDark:         boolean;
}

export default function ColorSeriesPanel({
  selectedTypes, liveTypes, seriesColors, onColorChange, onColorReset,
  textColor, accentColor, borderColor, isDark,
}: ColorSeriesPanelProps) {
  const getColor     = (tv: string, idx: number) => seriesColors[tv] ?? PALETTE[idx % PALETTE.length];
  const getTypeLabel = (tv: string) => liveTypes.find(t => t.value === tv)?.label ?? tv;
  const sectionLabel: React.CSSProperties = {
    fontSize: 9, fontWeight: 800, color: `${textColor}50`,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    fontFamily: "'OV Soge', sans-serif", marginBottom: 10,
  };

  return (
    <div>
      <div style={sectionLabel}>Series Colors</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {selectedTypes.map((tv, i) => (
          <ColorSwatch
            key={tv}
            tv={tv}
            label={getTypeLabel(tv)}
            color={getColor(tv, i)}
            idx={i}
            onColorChange={onColorChange}
            onColorReset={onColorReset}
            textColor={textColor}
            accentColor={accentColor}
            borderColor={borderColor}
            isDark={isDark}
            seriesColors={seriesColors}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Individual swatch ────────────────────────────────────────────────────────
function ColorSwatch({
  tv, label, color, idx, onColorChange, onColorReset,
  textColor, accentColor, borderColor, isDark, seriesColors,
}: {
  tv: string; label: string; color: string; idx: number;
  onColorChange: (tv: string, color: string) => void;
  onColorReset: (tv: string, idx: number) => void;
  textColor: string; accentColor: string; borderColor: string;
  isDark: boolean; seriesColors: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); }
    };
    document.addEventListener('mousedown', h);
    return () => { document.removeEventListener('mousedown', h); };
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen((p: boolean) => !p); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
          border:          `1px solid ${open ? accentColor : borderColor}`,
          backgroundColor: open ? `${accentColor}12` : 'transparent',
          transition:      'all 0.12s',
        }}
      >
        <span style={{
          width: 14, height: 14, borderRadius: 3, backgroundColor: color,
          border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0, display: 'inline-block',
        }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: textColor, fontFamily: "'OV Soge', sans-serif" }}>
          {label}
        </span>
        <ChevronDown size={9} style={{ color: `${textColor}50` }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200,
          backgroundColor: isDark ? '#1a2a3a' : '#fff',
          border: `1px solid ${borderColor}`, borderRadius: 10,
          padding: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', minWidth: 192,
        }}>
          {/* Preset swatches */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, marginBottom: 10 }}>
            {PALETTE.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { onColorChange(tv, c); }}
                style={{
                  width: 24, height: 24, borderRadius: 5, padding: 0, cursor: 'pointer',
                  backgroundColor: c,
                  border: `2px solid ${seriesColors[tv] === c ? textColor : 'transparent'}`,
                  boxShadow: seriesColors[tv] === c ? `0 0 0 1px ${c}` : 'none',
                  transition: 'all 0.1s',
                }}
              />
            ))}
          </div>
          {/* Custom colour + reset */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            paddingTop: 8, borderTop: `1px solid ${borderColor}`,
          }}>
            <span style={{
              fontSize: 9, color: `${textColor}55`, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              fontFamily: "'OV Soge', sans-serif",
            }}>Custom</span>
            <input
              type="color"
              value={color}
              onChange={e => { onColorChange(tv, e.target.value); }}
              style={{
                width: 32, height: 24, border: 'none', borderRadius: 4,
                cursor: 'pointer', padding: 0, backgroundColor: 'transparent',
              }}
            />
            <button
              type="button"
              onClick={() => { onColorReset(tv, idx); setOpen(false); }}
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 9, fontWeight: 700, color: `${textColor}55`,
                backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                padding: '3px 6px', borderRadius: 5, fontFamily: "'OV Soge', sans-serif",
              }}
            >
              <RotateCcw size={9} /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}