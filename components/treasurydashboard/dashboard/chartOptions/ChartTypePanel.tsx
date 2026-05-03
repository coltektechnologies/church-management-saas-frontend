'use client';

/**
 * ChartTypePanel.tsx
 * Panel for selecting chart family and sub-type.
 * Persists selection to localStorage via the key passed as prop.
 */

import { Check } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Sub = { id: string; label: string; icon: string; desc: string };
type Family = { id: string; label: string; icon: string; subs: Sub[] };

export const CHART_FAMILIES: Family[] = [
  {
    id: 'bar',
    label: 'Bar / Column',
    icon: '▐▐',
    subs: [
      { id: 'bar', label: 'Clustered Column', icon: '▐▐', desc: 'Side-by-side columns per period' },
      { id: 'bar-stacked', label: 'Stacked Column', icon: '▐', desc: 'Columns stacked to total' },
      { id: 'bar-100', label: '100% Stacked', icon: '%', desc: 'Each period normalised to 100%' },
      { id: 'bar-h', label: 'Horizontal Bar', icon: '═', desc: 'Bars run left → right' },
    ],
  },
  {
    id: 'line',
    label: 'Line',
    icon: '╱',
    subs: [
      { id: 'line', label: 'Line', icon: '╱', desc: 'Straight line segments' },
      { id: 'line-smooth', label: 'Smooth Line', icon: '∿', desc: 'Curved monotone interpolation' },
      {
        id: 'line-stepped',
        label: 'Step Line',
        icon: '⌐',
        desc: 'Staircase / stepped transitions',
      },
      {
        id: 'line-dots',
        label: 'Line + Markers',
        icon: '•╱',
        desc: 'Dots plotted at every data point',
      },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    icon: '◺',
    subs: [
      { id: 'area', label: 'Gradient Area', icon: '◺', desc: 'Filled area with gradient' },
      { id: 'area-solid', label: 'Solid Area', icon: '▬', desc: 'Flat solid colour fill' },
      {
        id: 'area-stacked',
        label: 'Stacked Area',
        icon: '≡',
        desc: 'Multiple series stacked on top',
      },
      { id: 'area-stepped', label: 'Step Area', icon: '⌐▬', desc: 'Step-interpolated area fill' },
    ],
  },
  {
    id: 'pie',
    label: 'Pie / Donut',
    icon: '◉',
    subs: [
      { id: 'pie-donut', label: 'Donut', icon: '◉', desc: 'Ring chart with centre total' },
      { id: 'pie-pie', label: 'Pie', icon: '●', desc: 'Classic filled pie chart' },
      { id: 'pie-semi', label: 'Semi-Donut', icon: '◓', desc: 'Half-donut gauge style' },
    ],
  },
  {
    id: 'radar',
    label: 'Radar',
    icon: '⬡',
    subs: [
      { id: 'radar', label: 'Radar / Spider', icon: '⬡', desc: 'Compare across months as spokes' },
      { id: 'radar-filled', label: 'Filled Radar', icon: '◆', desc: 'Filled radar with opacity' },
    ],
  },
  {
    id: 'radialbar',
    label: 'Radial',
    icon: '◎',
    subs: [
      { id: 'radialbar', label: 'Radial Bar', icon: '◎', desc: 'Circular progress bars per type' },
    ],
  },
  {
    id: 'scatter',
    label: 'Scatter',
    icon: '⋮',
    subs: [
      { id: 'scatter', label: 'Scatter Plot', icon: '⋮', desc: 'Month vs amount scattered plot' },
    ],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChartTypePanelProps {
  chartType: string;
  activeFamily: string;
  onChartType: (type: string) => void;
  onFamily: (family: string) => void;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

// ─── Shared pill style ────────────────────────────────────────────────────────
function pill(active: boolean, accent: string, border: string, text: string): React.CSSProperties {
  return {
    padding: '5px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: active ? 700 : 500,
    border: `1px solid ${active ? accent : border}`,
    backgroundColor: active ? `${accent}18` : 'transparent',
    color: active ? accent : `${text}60`,
    transition: 'all 0.12s',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChartTypePanel({
  chartType,
  activeFamily,
  onChartType,
  onFamily,
  textColor,
  accentColor,
  borderColor,
}: ChartTypePanelProps) {
  const currentFamily = CHART_FAMILIES.find((f) => f.id === activeFamily) ?? CHART_FAMILIES[0];

  const sectionLabel: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 800,
    color: `${textColor}50`,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 10,
  };

  return (
    <div>
      <div style={sectionLabel}>Chart Type</div>

      {/* Family selector */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {CHART_FAMILIES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              onFamily(f.id);
              onChartType(f.subs[0].id);
            }}
            style={{
              ...pill(activeFamily === f.id, accentColor, borderColor, textColor),
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span style={{ fontSize: 12 }}>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Sub-type grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
          gap: 6,
        }}
      >
        {currentFamily.subs.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChartType(s.id)}
            style={{
              padding: '8px 11px',
              borderRadius: 8,
              textAlign: 'left',
              cursor: 'pointer',
              border: `1px solid ${chartType === s.id ? accentColor : borderColor}`,
              backgroundColor: chartType === s.id ? `${accentColor}12` : 'transparent',
              boxShadow: chartType === s.id ? `0 0 0 1px ${accentColor}` : 'none',
              transition: 'all 0.12s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: chartType === s.id ? accentColor : textColor,
                }}
              >
                {s.label}
              </span>
              {chartType === s.id && (
                <Check size={9} style={{ color: accentColor, marginLeft: 'auto' }} />
              )}
            </div>
            <div style={{ fontSize: 9, color: `${textColor}50` }}>{s.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
