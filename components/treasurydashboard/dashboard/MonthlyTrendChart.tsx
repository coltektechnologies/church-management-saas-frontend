'use client';

/**
 * MonthlyTrendChart.tsx
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import { Settings2, X } from 'lucide-react';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import {
  getOptions,
  type DropdownOption,
} from '@/components/treasurydashboard/recordIncome/dropdownOptions';

// ── Sub-panels ────────────────────────────────────────────────────────────────
import ChartTypePanel, { CHART_FAMILIES } from './chartOptions/ChartTypePanel';
import CompareSeriesPanel, { PALETTE } from './chartOptions/CompareSeriesPanel';
import DateRangePanel, {
  TREASURY_PRESETS,
  resolveTreasuryPreset,
  type TreasuryDateRange,
} from './chartOptions/DateRangePanel';
import AppearancePanel from './chartOptions/AppearancePanel';
import ColorSeriesPanel from './chartOptions/ColorSeriesPanel';

// ─────────────────────────────────────────────────────────────────────────────
// Local constants
// ─────────────────────────────────────────────────────────────────────────────
export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function autoText(hex: string): string {
  const h = (hex || '#fff').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  const c = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

function fmtY(v: number | string): string {
  const n = Number(v);
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)}k`;
  }
  return String(n);
}

function hashStr(s: string): number {
  let h = 0;
  for (const ch of s) {
    h = (Math.imul(31, h) + ch.charCodeAt(0)) >>> 0;
  }
  return h;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic dummy monthly data
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_BASE: Record<string, number> = {
  tithe: 14_500,
  offering: 9_800,
  thanksgiving: 6_200,
  harvest: 4_100,
  welfare: 2_800,
  other: 3_500,
};
const TYPE_SEED: Record<string, number> = {
  tithe: 7341,
  offering: 2891,
  thanksgiving: 5612,
  harvest: 3309,
  welfare: 1247,
  other: 8823,
};

function lcg(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function buildMonthlyData(typeValues: string[]): Record<string, number | string>[] {
  return MONTHS.map((month, mi) => {
    const row: Record<string, number | string> = { month };
    typeValues.forEach((tv) => {
      const base = TYPE_BASE[tv] ?? 2_500 + (hashStr(tv) % 7_000);
      const seed = TYPE_SEED[tv] ?? (hashStr(tv) % 9_000) + 100;
      const rng = lcg(seed * 1_000 + mi * 173);
      rng();
      rng();
      const seasonal = base * 0.18 * Math.sin(((mi - 3) * Math.PI) / 6);
      const variance = base * 0.45;
      const decBoost = mi === 11 ? base * 0.28 : 0;
      const aprBoost = mi === 3 ? base * 0.15 : 0;
      row[tv] = Math.max(
        800,
        Math.round(base + seasonal + (rng() - 0.48) * variance + decBoost + aprBoost)
      );
    });
    return row;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: filter allData rows by an ISO date range
// Each row has a `month` label like 'Jan','Feb'… We map month index → rows.
// ─────────────────────────────────────────────────────────────────────────────
function filterByIsoRange(
  allData: Record<string, number | string>[],
  range: TreasuryDateRange,
  year: number
): Record<string, number | string>[] {
  if (!range.from && !range.to) {
    return allData;
  } // "all"

  const fromDate = range.from ? new Date(range.from) : null;
  const toDate = range.to ? new Date(range.to) : null;

  return allData.filter((_, mi) => {
    //  a representative date for the month (1st of that month)
    const d = new Date(year, mi, 1);
    if (fromDate && d < new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)) {
      return false;
    }
    if (toDate && d > new Date(toDate.getFullYear(), toDate.getMonth(), 1)) {
      return false;
    }
    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistence key & defaults
// ─────────────────────────────────────────────────────────────────────────────
const PREFS_KEY = 'mtc_prefs_v1';

interface MtcPrefs {
  chartType: string;
  activeFamily: string;
  selectedTypes: string[];
  /** 'preset' uses TREASURY_PRESETS; 'range' uses explicit ISO dates */
  rangeMode: 'preset' | 'range';
  preset: string;
  customFrom: string; // ISO "YYYY-MM-DD" or ""
  customTo: string; // ISO "YYYY-MM-DD" or ""
  showGrid: boolean;
  gridStyle: 'dashed' | 'solid';
  showLabels: boolean;
  legendPos: 'bottom' | 'top' | 'none';
  showBorder: boolean;
  seriesColors: Record<string, string>;
}

const DEFAULT_PREFS: MtcPrefs = {
  chartType: 'bar',
  activeFamily: 'bar',
  selectedTypes: [],
  rangeMode: 'preset',
  preset: 'all',
  customFrom: '',
  customTo: '',
  showGrid: true,
  gridStyle: 'dashed',
  showLabels: false,
  legendPos: 'bottom',
  showBorder: false,
  seriesColors: {},
};

function loadPrefs(): MtcPrefs {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFS;
  }
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_PREFS;
}

function savePrefs(p: MtcPrefs) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip
// ─────────────────────────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
  cardBg,
  textColor,
  liveTypes,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  cardBg: string;
  textColor: string;
  liveTypes: DropdownOption[];
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const getLabel = (v: string) => liveTypes.find((t) => t.value === v)?.label ?? v;
  return (
    <div
      style={{
        background: cardBg,
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        fontFamily: "'OV Soge', sans-serif",
      }}
    >
      <p style={{ fontSize: 11, color: `${textColor}80`, marginBottom: 6, fontWeight: 600 }}>
        {label}
      </p>
      {payload.map((item) => (
        <div
          key={item.name}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: item.color,
              flexShrink: 0,
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 11, color: `${textColor}70` }}>{getLabel(item.name)}</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: textColor,
              marginLeft: 'auto',
              paddingLeft: 16,
            }}
          >
            ₵ {Number(item.value).toLocaleString('en-GH', { minimumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Active panel type
// ─────────────────────────────────────────────────────────────────────────────
type ActivePanel =
  | 'chartType'
  | 'compareSeries'
  | 'dateRange'
  | 'appearance'
  | 'colorSeries'
  | null;

const PANEL_BUTTONS: { id: ActivePanel; label: string }[] = [
  { id: 'chartType', label: 'Chart Type' },
  { id: 'compareSeries', label: 'Series' },
  { id: 'dateRange', label: 'Date Range' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'colorSeries', label: 'Colors' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function MonthlyTrendChart() {
  const { profile, isReady } = useTreasuryProfile();

  const isDark = isReady ? profile.darkMode : false;
  const cardBg = isDark ? profile.darkBackgroundColor || '#0A1628' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const textColor = autoText(cardBg);
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';

  // ── Hydration-safe prefs init ─────────────────────────────────────────────
  const [prefs, setPrefsRaw] = useState<MtcPrefs>(DEFAULT_PREFS);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    setPrefsRaw(loadPrefs());
    setPrefsLoaded(true);
  }, [isReady]);

  const setPrefs = useCallback((updater: (prev: MtcPrefs) => MtcPrefs) => {
    setPrefsRaw((prev) => {
      const next = updater(prev);
      savePrefs(next);
      return next;
    });
  }, []);

  const {
    chartType,
    activeFamily,
    selectedTypes,
    rangeMode,
    preset,
    customFrom,
    customTo,
    showGrid,
    gridStyle,
    showLabels,
    legendPos,
    showBorder,
    seriesColors,
  } = prefs;

  // ── Active settings panel ─────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  // ── Live income types ─────────────────────────────────────────────────────
  const [liveTypes, setLiveTypes] = useState<DropdownOption[]>([]);
  useEffect(() => {
    const refresh = () => setLiveTypes(getOptions('income_types'));
    refresh();
    const id = setInterval(refresh, 1500);
    return () => clearInterval(id);
  }, []);

  // ── Stable key derived from liveTypes values — used as a dep below ────────
  // Extracted to a variable so the dep array contains a simple identifier,
  // not a complex inline expression.
  const liveTypeValuesKey = liveTypes.map((t) => t.value).join(',');

  // ── Sync selectedTypes with liveTypes ─────────────────────────────────────
  useEffect(() => {
    if (!liveTypes.length || !prefsLoaded) {
      return;
    }
    const validSet = new Set(liveTypes.map((t) => t.value));
    setPrefs((prev) => {
      const valid = prev.selectedTypes.filter((v) => validSet.has(v));
      const next = valid.length >= 1 ? valid : liveTypes.slice(0, 2).map((t) => t.value);
      if (JSON.stringify(next) === JSON.stringify(prev.selectedTypes)) {
        return prev;
      }
      return { ...prev, selectedTypes: next };
    });
    setPrefs((prev) => {
      const nextColors = { ...prev.seriesColors };
      liveTypes.forEach((t, i) => {
        if (!nextColors[t.value]) {
          nextColors[t.value] = PALETTE[i % PALETTE.length];
        }
      });
      return { ...prev, seriesColors: nextColors };
    });
  }, [liveTypeValuesKey, prefsLoaded, liveTypes, setPrefs]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const allData = useMemo(
    () => buildMonthlyData(liveTypes.map((t) => t.value)),
    // liveTypeValuesKey is a stable string representation of liveTypes values
    // and is the correct dep here — liveTypes object identity changes on every
    // interval tick even when values are identical, so using the key prevents
    // unnecessary recomputation while still reacting to real changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [liveTypeValuesKey]
  );

  // the active range from preset or custom inputs
  const activeRange = useMemo<TreasuryDateRange>(() => {
    if (rangeMode === 'range') {
      return { from: customFrom, to: customTo };
    }
    return resolveTreasuryPreset(preset);
  }, [rangeMode, preset, customFrom, customTo]);

  // Chart year — use current year for month→date mapping
  const chartYear = useMemo(() => new Date().getFullYear(), []);

  const filteredData = useMemo(
    () => filterByIsoRange(allData, activeRange, chartYear),
    [allData, activeRange, chartYear]
  );

  const normalizedData = useMemo(
    () =>
      filteredData.map((row) => {
        const total = selectedTypes.reduce((s, tv) => s + (Number(row[tv]) || 0), 0);
        const r: Record<string, number | string> = { month: row.month };
        selectedTypes.forEach((tv) => {
          r[tv] = total > 0 ? Math.round((Number(row[tv]) / total) * 100) : 0;
        });
        return r;
      }),
    [filteredData, selectedTypes]
  );

  const aggregated = useMemo(
    () =>
      selectedTypes.map((tv, i) => ({
        name: liveTypes.find((t) => t.value === tv)?.label ?? tv,
        value: filteredData.reduce((s, row) => s + (Number(row[tv]) || 0), 0),
        fill: seriesColors[tv] ?? PALETTE[i % PALETTE.length],
      })),
    [selectedTypes, filteredData, liveTypes, seriesColors]
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getColor = (tv: string, idx: number) => seriesColors[tv] ?? PALETTE[idx % PALETTE.length];

  // Extracted to useCallback so it can be safely referenced in useMemo deps
  const getTypeLabel = useCallback(
    (tv: string) => liveTypes.find((t) => t.value === tv)?.label ?? tv,
    [liveTypes]
  );

  // ── Dynamic heading ───────────────────────────────────────────────────────
  const heading = useMemo(() => {
    const labels = selectedTypes.map((tv) => getTypeLabel(tv));
    if (!labels.length) {
      return 'Income Trend';
    }
    if (labels.length === 1) {
      return `${labels[0]} — Monthly Trend`;
    }
    if (labels.length === 2) {
      return `${labels[0]} vs ${labels[1]}`;
    }
    return `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]} — Comparison`;
  }, [selectedTypes, getTypeLabel]);

  const subheading = useMemo(() => {
    const rangeLabel =
      rangeMode === 'preset'
        ? (TREASURY_PRESETS.find((p) => p.value === preset)?.label ?? 'All Time')
        : customFrom && customTo
          ? `${customFrom} → ${customTo}`
          : 'Custom Range';
    const typeLabel =
      CHART_FAMILIES.flatMap((f) => f.subs).find((s) => s.id === chartType)?.label ?? chartType;
    return `${filteredData.length} month${filteredData.length !== 1 ? 's' : ''} · ${rangeLabel} · ${typeLabel}`;
  }, [filteredData.length, rangeMode, preset, customFrom, customTo, chartType]);

  // ── Axis / grid ───────────────────────────────────────────────────────────
  const axisStyle = { fontSize: 10, fill: `${textColor}60`, fontFamily: "'OV Soge', sans-serif" };
  const gridProps = showGrid
    ? { stroke: `${textColor}12`, strokeDasharray: gridStyle === 'dashed' ? '3 3' : '0' }
    : undefined;

  // ── Tooltip renderer ──────────────────────────────────────────────────────
  const tooltipContent = (props: Record<string, unknown>) => (
    <ChartTooltip
      {...(props as Parameters<typeof ChartTooltip>[0])}
      cardBg={cardBg}
      textColor={textColor}
      liveTypes={liveTypes}
    />
  );

  // ── Legend ────────────────────────────────────────────────────────────────
  const commonLegend =
    legendPos !== 'none' ? (
      <Legend
        verticalAlign={legendPos}
        wrapperStyle={{
          fontSize: 10,
          fontFamily: "'OV Soge', sans-serif",
          paddingTop: legendPos === 'bottom' ? 8 : 0,
        }}
        formatter={(v) => (
          <span style={{ color: textColor, fontSize: 10 }}>{getTypeLabel(String(v))}</span>
        )}
      />
    ) : undefined;

  // ── Render chart ──────────────────────────────────────────────────────────
  const renderChart = () => {
    if (!selectedTypes.length) {
      return null;
    }
    const family = activeFamily;

    // ── BAR ──────────────────────────────────────────────────────────────────
    if (family === 'bar') {
      const isH = chartType === 'bar-h';
      const is100 = chartType === 'bar-100';
      const isSt = chartType === 'bar-stacked' || is100;
      const data = is100 ? normalizedData : filteredData;

      return (
        <BarChart
          data={data}
          layout={isH ? 'vertical' : 'horizontal'}
          margin={{ top: showLabels ? 18 : 4, right: 8, left: 0, bottom: 0 }}
        >
          {gridProps && <CartesianGrid {...gridProps} horizontal={!isH} vertical={isH} />}
          {isH ? (
            <>
              <XAxis
                type="number"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number | string) => (is100 ? `${v}%` : fmtY(v))}
                width={44}
              />
              <YAxis
                type="category"
                dataKey="month"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={36}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number | string) => (is100 ? `${v}%` : fmtY(v))}
                width={44}
              />
            </>
          )}
          <Tooltip content={tooltipContent} />
          {commonLegend}
          {selectedTypes.map((tv, i) => (
            <Bar
              key={tv}
              dataKey={tv}
              name={tv}
              fill={getColor(tv, i)}
              stackId={isSt ? 'a' : undefined}
              radius={isSt ? undefined : [3, 3, 0, 0]}
            >
              {showLabels && (
                <LabelList
                  dataKey={tv}
                  position={isH ? 'right' : 'top'}
                  style={{ fontSize: 9, fill: textColor, fontFamily: "'OV Soge',sans-serif" }}
                  formatter={(v: unknown) => (is100 ? `${Number(v)}%` : fmtY(Number(v)))}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      );
    }

    // ── LINE ─────────────────────────────────────────────────────────────────
    if (family === 'line') {
      const curve =
        chartType === 'line-smooth'
          ? 'monotone'
          : chartType === 'line-stepped'
            ? 'stepAfter'
            : 'linear';
      const showDot = chartType === 'line-dots';
      return (
        <LineChart
          data={filteredData}
          margin={{ top: showLabels ? 18 : 4, right: 8, left: 0, bottom: 0 }}
        >
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtY}
            width={44}
          />
          <Tooltip content={tooltipContent} />
          {commonLegend}
          {selectedTypes.map((tv, i) => (
            <Line
              key={tv}
              type={curve as 'linear'}
              dataKey={tv}
              name={tv}
              stroke={getColor(tv, i)}
              strokeWidth={2.5}
              dot={showDot ? { r: 4, fill: getColor(tv, i), strokeWidth: 0 } : false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            >
              {showLabels && (
                <LabelList
                  dataKey={tv}
                  position="top"
                  style={{ fontSize: 9, fill: textColor, fontFamily: "'OV Soge',sans-serif" }}
                  formatter={(v: unknown) => fmtY(Number(v))}
                />
              )}
            </Line>
          ))}
        </LineChart>
      );
    }

    // ── AREA ─────────────────────────────────────────────────────────────────
    if (family === 'area') {
      const isSolid = chartType === 'area-solid';
      const isStacked = chartType === 'area-stacked';
      const isStepped = chartType === 'area-stepped';
      const curve = isStepped ? 'stepAfter' : 'monotone';
      return (
        <AreaChart
          data={filteredData}
          margin={{ top: showLabels ? 18 : 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            {selectedTypes.map((tv, i) => {
              const c = getColor(tv, i);
              return (
                <linearGradient key={tv} id={`grad-${tv}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={isSolid ? 0.7 : 0.45} />
                  <stop offset="95%" stopColor={c} stopOpacity={isSolid ? 0.5 : 0.03} />
                </linearGradient>
              );
            })}
          </defs>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtY}
            width={44}
          />
          <Tooltip content={tooltipContent} />
          {commonLegend}
          {selectedTypes.map((tv, i) => (
            <Area
              key={tv}
              type={curve as 'monotone'}
              dataKey={tv}
              name={tv}
              stroke={getColor(tv, i)}
              strokeWidth={2}
              fill={`url(#grad-${tv})`}
              fillOpacity={1}
              stackId={isStacked ? 'a' : undefined}
            >
              {showLabels && (
                <LabelList
                  dataKey={tv}
                  position="top"
                  style={{ fontSize: 9, fill: textColor, fontFamily: "'OV Soge',sans-serif" }}
                  formatter={(v: unknown) => fmtY(Number(v))}
                />
              )}
            </Area>
          ))}
        </AreaChart>
      );
    }

    // ── PIE / DONUT ───────────────────────────────────────────────────────────
    if (family === 'pie') {
      const isDonut = chartType === 'pie-donut';
      const isSemi = chartType === 'pie-semi';
      const innerR = isDonut || isSemi ? '52%' : '0%';
      return (
        <PieChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <Tooltip content={tooltipContent} />
          {commonLegend}
          <Pie
            data={aggregated}
            cx="50%"
            cy={isSemi ? '72%' : '50%'}
            innerRadius={innerR}
            outerRadius="75%"
            startAngle={isSemi ? 180 : 0}
            endAngle={isSemi ? 0 : 360}
            dataKey="value"
            paddingAngle={2}
            label={
              showLabels
                ? ({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                : undefined
            }
            labelLine={showLabels}
          >
            {aggregated.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.fill} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      );
    }

    // ── RADAR ─────────────────────────────────────────────────────────────────
    if (family === 'radar') {
      const isFilled = chartType === 'radar-filled';
      return (
        <RadarChart data={filteredData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
          <PolarGrid stroke={`${textColor}15`} />
          <PolarAngleAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: `${textColor}60`, fontFamily: "'OV Soge',sans-serif" }}
          />
          <PolarRadiusAxis tick={false} axisLine={false} />
          <Tooltip content={tooltipContent} />
          {commonLegend}
          {selectedTypes.map((tv, i) => (
            <Radar
              key={tv}
              name={tv}
              dataKey={tv}
              stroke={getColor(tv, i)}
              strokeWidth={2}
              fill={getColor(tv, i)}
              fillOpacity={isFilled ? 0.22 : 0}
            />
          ))}
        </RadarChart>
      );
    }

    // ── RADIAL BAR ────────────────────────────────────────────────────────────
    if (family === 'radialbar') {
      const maxVal = Math.max(...aggregated.map((d) => d.value), 1);
      const rData = aggregated.map((d) => ({ ...d, pct: Math.round((d.value / maxVal) * 100) }));
      return (
        <RadialBarChart
          innerRadius="20%"
          outerRadius="95%"
          data={rData}
          startAngle={180}
          endAngle={0}
          margin={{ top: 0, right: 40, bottom: 0, left: 40 }}
        >
          <RadialBar
            dataKey="pct"
            cornerRadius={4}
            label={
              showLabels
                ? {
                    position: 'insideStart',
                    fill: '#fff',
                    fontSize: 10,
                    fontFamily: "'OV Soge',sans-serif",
                  }
                : false
            }
          />
          <Tooltip content={tooltipContent} />
          {commonLegend}
        </RadialBarChart>
      );
    }

    // ── SCATTER ───────────────────────────────────────────────────────────────
    if (family === 'scatter') {
      return (
        <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          {gridProps && <CartesianGrid {...gridProps} />}
          <XAxis
            type="number"
            dataKey="x"
            name="Month"
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => MONTHS[v] ?? String(v)}
            domain={[0, Math.max(filteredData.length - 1, 0)]}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Amount"
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtY}
            width={44}
          />
          <Tooltip content={tooltipContent} cursor={{ strokeDasharray: '3 3' }} />
          {commonLegend}
          {selectedTypes.map((tv, si) => (
            <Scatter
              key={tv}
              name={tv}
              data={filteredData.map((row, mi) => ({ x: mi, y: Number(row[tv]) || 0 }))}
              fill={getColor(tv, si)}
            />
          ))}
        </ScatterChart>
      );
    }

    return null;
  };

  // ── Summary totals ────────────────────────────────────────────────────────
  const summaryTotals = selectedTypes.map((tv, i) => ({
    label: getTypeLabel(tv),
    total: filteredData.reduce((s, row) => s + (Number(row[tv]) || 0), 0),
    color: getColor(tv, i),
  }));

  const commonPanelProps = { textColor, accentColor, borderColor, isDark };

  // ── Range label for summary footer ───────────────────────────────────────
  const rangeSummaryLabel =
    rangeMode === 'preset'
      ? (TREASURY_PRESETS.find((p) => p.value === preset)?.label ?? 'All Time')
      : customFrom && customTo
        ? `${customFrom} → ${customTo}`
        : 'Custom Range';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        backgroundColor: cardBg,
        border: `${showBorder ? '2px' : '1px'} solid ${showBorder ? accentColor + '60' : borderColor}`,
        borderRadius: 10,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        fontFamily: "'OV Soge', sans-serif",
      }}
    >
      {/* ──────────────── HEADER ──────────────── */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: activePanel ? `1px solid ${borderColor}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {/* Title */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(12px, 1.8vw, 14px)',
              color: textColor,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {heading}
          </h3>
          <p style={{ fontSize: 10, color: `${textColor}55`, margin: '2px 0 0' }}>{subheading}</p>
        </div>

        {/* Option pill buttons */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          {PANEL_BUTTONS.map((btn) => {
            const isActive = activePanel === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActivePanel(isActive ? null : btn.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 600,
                  border: `1px solid ${isActive ? accentColor : borderColor}`,
                  backgroundColor: isActive ? `${accentColor}18` : 'transparent',
                  color: isActive ? accentColor : `${textColor}70`,
                  transition: 'all 0.15s',
                }}
              >
                {isActive && <Settings2 size={10} />}
                {btn.label}
              </button>
            );
          })}

          {/* Close button — only when a panel is open */}
          {activePanel && (
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: '50%',
                cursor: 'pointer',
                border: `1px solid ${borderColor}`,
                backgroundColor: `${textColor}08`,
                color: `${textColor}60`,
                transition: 'all 0.15s',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ──────────────── SETTINGS PANEL ──────────────── */}
      {activePanel && (
        <div
          style={{
            padding: '16px 18px',
            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#FAFBFC',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          {activePanel === 'chartType' && (
            <ChartTypePanel
              chartType={chartType}
              activeFamily={activeFamily}
              onChartType={(v) => setPrefs((p) => ({ ...p, chartType: v }))}
              onFamily={(v) => setPrefs((p) => ({ ...p, activeFamily: v }))}
              {...commonPanelProps}
            />
          )}

          {activePanel === 'compareSeries' && (
            <CompareSeriesPanel
              liveTypes={liveTypes}
              selectedTypes={selectedTypes}
              seriesColors={seriesColors}
              onToggle={(value) =>
                setPrefs((p) => {
                  const active = p.selectedTypes.includes(value);
                  return {
                    ...p,
                    selectedTypes: active
                      ? p.selectedTypes.length > 1
                        ? p.selectedTypes.filter((v) => v !== value)
                        : p.selectedTypes
                      : [...p.selectedTypes, value],
                  };
                })
              }
              {...commonPanelProps}
            />
          )}

          {activePanel === 'dateRange' && (
            <DateRangePanel
              mode={rangeMode}
              preset={preset}
              customFrom={customFrom}
              customTo={customTo}
              onMode={(v) => setPrefs((p) => ({ ...p, rangeMode: v }))}
              onPreset={(v) => setPrefs((p) => ({ ...p, preset: v }))}
              onFromChange={(v) => setPrefs((p) => ({ ...p, customFrom: v }))}
              onToChange={(v) => setPrefs((p) => ({ ...p, customTo: v }))}
              {...commonPanelProps}
            />
          )}

          {activePanel === 'appearance' && (
            <AppearancePanel
              showGrid={showGrid}
              gridStyle={gridStyle}
              showLabels={showLabels}
              showBorder={showBorder}
              legendPos={legendPos}
              onShowGrid={(v) => setPrefs((p) => ({ ...p, showGrid: v }))}
              onGridStyle={(v) => setPrefs((p) => ({ ...p, gridStyle: v }))}
              onShowLabels={(v) => setPrefs((p) => ({ ...p, showLabels: v }))}
              onShowBorder={(v) => setPrefs((p) => ({ ...p, showBorder: v }))}
              onLegendPos={(v) => setPrefs((p) => ({ ...p, legendPos: v }))}
              {...commonPanelProps}
            />
          )}

          {activePanel === 'colorSeries' && (
            <ColorSeriesPanel
              selectedTypes={selectedTypes}
              liveTypes={liveTypes}
              seriesColors={seriesColors}
              onColorChange={(tv, color) =>
                setPrefs((p) => ({ ...p, seriesColors: { ...p.seriesColors, [tv]: color } }))
              }
              onColorReset={(tv, idx) =>
                setPrefs((p) => ({
                  ...p,
                  seriesColors: { ...p.seriesColors, [tv]: PALETTE[idx % PALETTE.length] },
                }))
              }
              {...commonPanelProps}
            />
          )}
        </div>
      )}

      {/* ──────────────── CHART AREA ──────────────── */}
      <div style={{ padding: '14px 18px 6px' }}>
        {selectedTypes.length === 0 ? (
          <div
            style={{
              height: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: `1px dashed ${borderColor}`,
              borderRadius: 8,
              backgroundColor: `${textColor}04`,
            }}
          >
            <span style={{ fontSize: 28, opacity: 0.2 }}>📊</span>
            <p
              style={{ fontSize: 12, color: `${textColor}50`, fontFamily: "'OV Soge', sans-serif" }}
            >
              Select at least one income series above
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', height: 268, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              {(renderChart() as React.ReactElement) ?? <LineChart data={[]} />}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ──────────────── SUMMARY BAR ──────────────── */}
      {summaryTotals.length > 0 && (
        <div style={{ padding: '10px 18px 14px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {summaryTotals.map((s) => (
            <div
              key={s.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                borderRadius: 8,
                border: `1px solid ${s.color}30`,
                backgroundColor: `${s.color}08`,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: s.color,
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: `${textColor}60`,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: textColor,
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  ₵&nbsp;{s.total.toLocaleString('en-GH', { minimumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
            <span
              style={{
                fontSize: 9,
                color: `${textColor}40`,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {rangeSummaryLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
