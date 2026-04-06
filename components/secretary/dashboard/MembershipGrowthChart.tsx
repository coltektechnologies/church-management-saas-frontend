'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  type PieLabelRenderProps,
} from 'recharts';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';
import { useAppData } from '@/components/secretary/contexts/AppDataContext';
import {
  useOptionalSecretaryDashboardApi,
  type MemberRegistrationMonthBucket,
} from '@/components/secretary/contexts/SecretaryDashboardApiContext';

const MONTH_NAMES = [
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

// ── Extended activity shape ───────────────────────────────────────────────────
interface ActivityWithType {
  timestamp: number;
  tab?: string;
  entity?: string;
  action?: string;
  type?: string;
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_DATA = [
  { name: 'Jan', members: 45 },
  { name: 'Feb', members: 62 },
  { name: 'Mar', members: 58 },
  { name: 'Apr', members: 81 },
  { name: 'May', members: 94 },
  { name: 'Jun', members: 110 },
  { name: 'Jul', members: 103 },
  { name: 'Aug', members: 128 },
  { name: 'Sep', members: 142 },
  { name: 'Oct', members: 135 },
  { name: 'Nov', members: 160 },
  { name: 'Dec', members: 178 },
];

function isMemberActivity(a: ActivityWithType): boolean {
  return (
    a.tab?.toLowerCase().includes('member') === true ||
    a.entity?.toLowerCase().includes('member') === true ||
    a.action?.toLowerCase().includes('member') === true ||
    a.type === 'member_added' ||
    a.type === 'member_updated' ||
    a.type === 'member_removed'
  );
}

// ── Format large numbers on Y-axis (e.g. 5000 → 5k) ─────────────────────────
function formatYAxis(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}k`;
  }
  return String(value);
}

// ── Derive a nice Y-axis upper bound with breathing room ─────────────────────
function niceMax(max: number): number {
  if (max === 0) {
    return 10;
  }
  const withPadding = max * 1.15;
  const magnitude = Math.pow(10, Math.floor(Math.log10(withPadding)));
  const nice = Math.ceil(withPadding / magnitude) * magnitude;
  return nice;
}

// ── Derive chart container height from data magnitude ─────────────────────────
function deriveChartHeight(maxValue: number): number {
  if (maxValue <= 200) {
    return 260;
  }
  if (maxValue <= 1_000) {
    return 300;
  }
  if (maxValue <= 5_000) {
    return 340;
  }
  if (maxValue <= 20_000) {
    return 380;
  }
  return 420;
}

// ── Y-axis tick count: more members → more ticks for readability ──────────────
function deriveTickCount(maxValue: number): number {
  if (maxValue <= 200) {
    return 5;
  }
  if (maxValue <= 1_000) {
    return 6;
  }
  if (maxValue <= 5_000) {
    return 7;
  }
  return 8;
}

/** `YYYY-MM` → short label for chart axis (e.g. Jan 25) */
function formatYmLabel(ym: string): string {
  const [ys, ms] = ym.split('-').map(Number);
  if (!ys || !ms) {
    return ym;
  }
  return new Date(ys, ms - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function monthOverlapMs(
  period: string,
  fromMs: number,
  toMs: number
): { overlaps: boolean; start: number } | null {
  const parts = period.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  if (!y || !m) {
    return null;
  }
  const start = new Date(y, m - 1, 1).getTime();
  const end = new Date(y, m, 0, 23, 59, 59, 999).getTime();
  const overlaps = start <= toMs && end >= fromMs;
  return { overlaps, start };
}

// ── Growth series: API member `created_at` buckets (preferred), else local activity log, else demo ──
function useGrowthData(
  rangeMode: 'preset' | 'custom',
  presetRange: string,
  customFrom: string,
  customTo: string,
  apiBuckets: MemberRegistrationMonthBucket[]
) {
  const { activities } = useAppData();

  return useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();

    let fromMs = 0;
    let toMs = now.getTime();

    if (rangeMode === 'custom' && customFrom && customTo) {
      fromMs = new Date(customFrom).getTime();
      toMs = new Date(customTo).getTime();
    } else {
      switch (presetRange) {
        case '30d':
          fromMs = toMs - 30 * 86_400_000;
          break;
        case '90d':
          fromMs = toMs - 90 * 86_400_000;
          break;
        case '6m':
          fromMs = toMs - 182 * 86_400_000;
          break;
        case 'year':
          fromMs = new Date(year, 0, 1).getTime();
          break;
        default:
          fromMs = 0;
      }
    }

    if (apiBuckets.length > 0) {
      const filtered = apiBuckets
        .map((b) => ({ b, ov: monthOverlapMs(b.period, fromMs, toMs) }))
        .filter((x) => x.ov?.overlaps)
        .sort((a, b) => (a.ov?.start ?? 0) - (b.ov?.start ?? 0));
      if (filtered.length > 0) {
        return filtered.map(({ b }) => ({
          name: formatYmLabel(b.period),
          members: b.count,
        }));
      }
      /* API has history but selected range has no registrations — do not fall back to demo data. */
      return [];
    }

    const buckets: Record<string, number> = {};

    for (const a of activities as ActivityWithType[]) {
      const ts = a.timestamp;
      if (isNaN(ts) || ts < fromMs || ts > toMs) {
        continue;
      }
      if (!isMemberActivity(a)) {
        continue;
      }

      const d = new Date(ts);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      buckets[key] = (buckets[key] ?? 0) + 1;
    }

    const hasRealData = Object.keys(buckets).length > 0;

    if (!hasRealData) {
      return MOCK_DATA;
    }

    return Object.keys(buckets)
      .sort()
      .map((key) => {
        const mPart = parseInt(key.split('-')[1] ?? '1', 10);
        const idx = Number.isFinite(mPart) ? mPart - 1 : 0;
        const safeIdx = idx >= 0 && idx < 12 ? idx : 0;
        return { name: MONTH_NAMES[safeIdx], members: buckets[key] };
      });
  }, [activities, apiBuckets, rangeMode, presetRange, customFrom, customTo]);
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  value: number;
  fill?: string;
  stroke?: string;
  color?: string;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }
  const item = payload[0];
  const color = item?.fill ?? item?.stroke ?? item?.color ?? '#000';
  const value = item?.value ?? 0;
  return (
    <div
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        padding: '5px 10px',
        fontSize: 11,
        boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
      }}
    >
      <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: 2, fontSize: 10 }}>
        {label}
      </p>
      <p style={{ color, fontWeight: 700, fontSize: 12 }}>
        {value.toLocaleString()} member{value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function renderPieLabel(props: PieLabelRenderProps) {
  const pct = typeof props.percent === 'number' ? `${(props.percent * 100).toFixed(1)}%` : '';
  return `${props.name ?? ''} ${pct}`;
}

function toQuarterData(data: { name: string; members: number }[]) {
  const quarters: Record<string, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  const monthToQ: Record<string, keyof typeof quarters> = {
    Jan: 'Q1',
    Feb: 'Q1',
    Mar: 'Q1',
    Apr: 'Q2',
    May: 'Q2',
    Jun: 'Q2',
    Jul: 'Q3',
    Aug: 'Q3',
    Sep: 'Q3',
    Oct: 'Q4',
    Nov: 'Q4',
    Dec: 'Q4',
  };
  for (const d of data) {
    const q = monthToQ[d.name];
    if (q) {
      quarters[q] += d.members;
    }
  }
  return Object.entries(quarters)
    .filter(([, v]) => v > 0)
    .map(([name, members]) => ({ name, members }));
}

interface GridProps {
  show: boolean;
  style: 'dashed' | 'solid';
}
function ChartGrid({ show, style }: GridProps) {
  if (!show) {
    return null;
  }
  return (
    <CartesianGrid
      horizontal
      vertical
      strokeDasharray={style === 'dashed' ? '3 3' : ''}
      stroke="#C8C8C8"
      strokeWidth={0.75}
      strokeOpacity={1}
    />
  );
}

interface SmartDropdownProps {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  minWidth?: number;
}
function SmartDropdown({ open, onClose, trigger, children, minWidth = 220 }: SmartDropdownProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !dropRef.current) {
      return;
    }
    const rect = dropRef.current.getBoundingClientRect();
    setFlip(rect.right > window.innerWidth - 8);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      {trigger}
      {open && (
        <div
          ref={dropRef}
          className="absolute bg-card border border-border rounded-lg shadow-xl p-3"
          style={{
            top: '100%',
            left: flip ? 'auto' : '0',
            right: flip ? '0' : 'auto',
            marginTop: '4px',
            minWidth,
            zIndex: 300,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── ChartTypePicker — two-level dropdown (family + sub) ───────────────────────
//
// Replaces the flat <select> for chart type. Renders a trigger button that
// shows the current sub-type label, and on click opens a two-column panel:
//   left  → family list  (Bar/Column, Line, Area, Pie/Donut)
//   right → sub-options grid for the hovered family
//
// The trigger button uses `width: max-content` so it only takes as much
// horizontal space as the selected label actually needs — no fixed width.

interface ChartSubOption {
  id: string;
  label: string;
  icon: string;
  desc: string;
}
interface ChartFamily {
  id: string;
  label: string;
  icon: string;
  subs: ChartSubOption[];
}

const CHART_FAMILIES: ChartFamily[] = [
  {
    id: 'bar',
    label: 'Bar / Column',
    icon: '▐',
    subs: [
      { id: 'bar', label: 'Clustered Column', icon: '▐▐', desc: 'Side-by-side columns' },
      { id: 'bar-stacked', label: 'Stacked Column', icon: '▐̲', desc: 'Columns stacked to total' },
      { id: 'bar-100', label: '100% Stacked', icon: '%', desc: 'Normalised to 100%' },
      { id: 'bar-horizontal', label: 'Horizontal Bar', icon: '═', desc: 'Bars run left → right' },
    ],
  },
  {
    id: 'line',
    label: 'Line',
    icon: '╱',
    subs: [
      { id: 'line', label: 'Line', icon: '╱', desc: 'Straight segments' },
      { id: 'line-smooth', label: 'Smooth Line', icon: '∿', desc: 'Curved monotone' },
      { id: 'line-stepped', label: 'Step Line', icon: '⌐', desc: 'Staircase steps' },
      { id: 'line-dots', label: 'Line + Markers', icon: '•╱•', desc: 'Dots at every point' },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    icon: '◺',
    subs: [
      { id: 'area', label: 'Gradient Area', icon: '◺', desc: 'Filled with gradient' },
      { id: 'area-solid', label: 'Solid Area', icon: '▬', desc: 'Flat solid fill' },
      { id: 'area-stacked', label: 'Stacked Area', icon: '◺◺', desc: 'Multiple series stacked' },
      { id: 'area-stepped', label: 'Step Area', icon: '⌐▬', desc: 'Step-filled area' },
    ],
  },
  {
    id: 'pie',
    label: 'Pie / Donut',
    icon: '◉',
    subs: [
      { id: 'pie', label: 'Donut', icon: '◉', desc: 'Ring with centre total' },
      { id: 'pie-pie', label: 'Pie', icon: '●', desc: 'Classic filled pie' },
      { id: 'pie-semi', label: 'Semi', icon: '◓', desc: 'Half-donut gauge' },
      { id: 'pie-quarter', label: 'Quarterly', icon: '◑', desc: 'Grouped by quarter' },
    ],
  },
];

const ALL_SUBS = CHART_FAMILIES.flatMap((f) => f.subs);
const subById = (id: string) => ALL_SUBS.find((s) => s.id === id);
const familyOfSub = (subId: string) =>
  CHART_FAMILIES.find((f) => f.subs.some((s) => s.id === subId));

interface ChartTypePickerProps {
  value: string;
  onChange: (id: string) => void;
}

function ChartTypePicker({ value, onChange }: ChartTypePickerProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(() => familyOfSub(value)?.id ?? 'bar');
  const wrapRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [flip, setFlip] = useState(false);

  const currentSub = subById(value);
  const currentFamily = familyOfSub(value);
  const hoveredFamily = CHART_FAMILIES.find((f) => f.id === hovered) ?? CHART_FAMILIES[0];

  // Close on outside click
  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Flip panel left if it would overflow viewport
  useEffect(() => {
    if (!open || !dropRef.current) {
      return;
    }
    const rect = dropRef.current.getBoundingClientRect();
    setFlip(rect.right > window.innerWidth - 8);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      {/* ── Trigger button — width hugs the label text ── */}
      <button
        onClick={() => {
          setOpen((o) => !o);
          setHovered(familyOfSub(value)?.id ?? 'bar');
        }}
        className="flex items-center gap-1 text-[9px] sm:text-[10px] border border-border rounded-full px-2 sm:px-3 py-1 bg-card text-foreground hover:bg-muted transition-colors"
        style={{ width: 'max-content' }}
      >
        <span style={{ fontSize: 13, lineHeight: 1 }}>{currentSub?.icon ?? '▐▐'}</span>
        <span className="truncate" style={{ maxWidth: 96 }}>
          {currentSub?.label ?? 'Chart type'}
        </span>
        <ChevronDown size={10} className="text-muted-foreground shrink-0" />
      </button>

      {/* ── Drop panel ── */}
      {open && (
        <div
          ref={dropRef}
          className="absolute bg-card border border-border rounded-xl shadow-2xl p-3"
          style={{
            top: '100%',
            left: flip ? 'auto' : '0',
            right: flip ? '0' : 'auto',
            marginTop: 4,
            zIndex: 300,
            // Width is driven by content; two columns side-by-side
            width: 'max-content',
            minWidth: 340,
            maxWidth: '95vw',
          }}
        >
          <div style={{ display: 'flex', gap: 0 }}>
            {/* ── Left: family list ── */}
            <div
              style={{
                // Width fits the longest family label — no fixed px
                width: 'max-content',
                minWidth: 110,
                borderRight: '1px solid hsl(var(--border))',
                paddingRight: 8,
                flexShrink: 0,
              }}
            >
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 pl-1">
                Type
              </p>
              {CHART_FAMILIES.map((f) => {
                const isActive = currentFamily?.id === f.id;
                const isHov = hovered === f.id;
                return (
                  <button
                    key={f.id}
                    onMouseEnter={() => setHovered(f.id)}
                    onClick={() => {
                      onChange(f.subs[0].id);
                      setOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
                    style={{
                      background: isHov ? 'hsl(var(--muted))' : 'transparent',
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{f.icon}</span>
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* ── Right: sub-option grid ── */}
            <div style={{ flex: 1, paddingLeft: 10 }}>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                {hoveredFamily.label}
              </p>
              <div
                style={{
                  display: 'grid',
                  // Two columns; each column fits its content — no fixed width
                  gridTemplateColumns: 'repeat(2, max-content)',
                  gap: 6,
                }}
              >
                {hoveredFamily.subs.map((s) => {
                  const active = value === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onChange(s.id);
                        setOpen(false);
                      }}
                      className="flex flex-col items-start gap-1 rounded-xl p-2 border transition-all text-left hover:shadow-md"
                      style={{
                        border: active
                          ? '2px solid hsl(var(--primary))'
                          : '1.5px solid hsl(var(--border))',
                        background: active ? 'hsl(var(--primary) / 0.07)' : 'hsl(var(--card))',
                        // Width hugs content — no overflow, no fixed px
                        width: 'max-content',
                        minWidth: 100,
                      }}
                    >
                      <span style={{ fontSize: 20, lineHeight: 1.1, opacity: 0.82 }}>{s.icon}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: active ? 700 : 500,
                          color: 'hsl(var(--foreground))',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.label}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: 'hsl(var(--muted-foreground))',
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function MembershipGrowthChart() {
  const apiCtx = useOptionalSecretaryDashboardApi();
  const apiBuckets = apiCtx?.memberRegistrationBuckets ?? [];

  const { profile, isReady } = useSecretaryProfile();

  const isDark = isReady ? profile.darkMode : false;
  const pc = isReady
    ? isDark
      ? profile.darkPrimaryColor || '#1A3F6B'
      : profile.primaryColor || '#0B2A4A'
    : '#0B2A4A';
  const ac = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const DEFAULT_COLORS = [pc, ac, '#E4002B', '#FFB020', '#6366F1', '#EC4899', '#14B8A6', '#F97316'];

  // chartType now stores the sub-option id (e.g. 'bar', 'line-smooth', 'pie', …)
  // The render logic below maps sub-ids → Recharts components.
  const [chartType, setChartType] = useState('bar');
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
  const [presetRange, setPresetRange] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showGrid, setShowGrid] = useState(true);
  const [gridStyle, setGridStyle] = useState<'dashed' | 'solid'>('solid');
  const [colors, setColors] = useState([pc, ac]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [barColors, setBarColors] = useState<Record<number, string>>({});
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [showBorder, setShowBorder] = useState(false);

  const filteredData = useGrowthData(rangeMode, presetRange, customFrom, customTo, apiBuckets);

  const maxValue = useMemo(
    () => Math.max(0, ...filteredData.map((d) => d.members)),
    [filteredData]
  );
  const yDomainMax = useMemo(() => niceMax(maxValue), [maxValue]);
  const chartHeight = useMemo(() => deriveChartHeight(maxValue), [maxValue]);
  const yTickCount = useMemo(() => deriveTickCount(maxValue), [maxValue]);

  const yAxisWidth = useMemo(() => {
    if (maxValue >= 1_000_000) {
      return 48;
    }
    if (maxValue >= 10_000) {
      return 44;
    }
    if (maxValue >= 1_000) {
      return 40;
    }
    return 32;
  }, [maxValue]);

  const getColor = (i: number) => barColors[i] ?? colors[i % colors.length];
  const primarySeriesColor = colors[0] ?? pc;
  const margin = { top: 8, right: 16, left: 0, bottom: 4 };
  const axisStyle = { fontSize: 11, fill: '#6B7280', fontFamily: 'inherit' };

  const xAxisProps = {
    dataKey: 'name' as const,
    tick: axisStyle,
    axisLine: { stroke: '#D1D5DB', strokeWidth: 1 },
    tickLine: { stroke: '#D1D5DB', strokeWidth: 1 },
    tickSize: 3,
  };

  const yAxisProps = {
    tick: axisStyle,
    axisLine: { stroke: '#D1D5DB', strokeWidth: 1 },
    tickLine: { stroke: '#D1D5DB', strokeWidth: 1 },
    tickSize: 3,
    width: yAxisWidth,
    domain: [0, yDomainMax] as [number, number],
    tickCount: yTickCount,
    tickFormatter: formatYAxis,
    allowDataOverflow: false,
  };

  const { activities } = useAppData();
  const hasApiGrowth = apiBuckets.length > 0;
  const usingMockData = !hasApiGrowth && !(activities as ActivityWithType[]).some(isMemberActivity);

  // Derive the family from the chosen sub-id
  const activeFamily = familyOfSub(chartType)?.id ?? 'bar';

  // Curve / stepped helpers for line + area
  type CurveType = 'linear' | 'monotone' | 'step';
  const curveFor = (): CurveType => {
    if (chartType.includes('smooth')) {
      return 'monotone';
    }
    if (chartType.includes('step') || chartType.includes('stepped')) {
      return 'step';
    }
    return 'linear';
  };
  const dotRadius = chartType === 'line-dots' ? 4 : 2.5;

  const renderChart = () => {
    // ── PIE / DONUT ───────────────────────────────────────────────────────────
    if (activeFamily === 'pie') {
      const pieData = toQuarterData(filteredData);
      const total = pieData.reduce((s, d) => s + d.members, 0);
      const isSolid = chartType === 'pie-pie';
      const isSemi = chartType === 'pie-semi';
      const innerRadius = isSolid ? '0%' : isSemi ? '55%' : '48%';
      const outerRadius = '70%';
      const startAngle = isSemi ? 180 : 0;
      const endAngle = isSemi ? 0 : 360;
      const cy = isSemi ? '70%' : '50%';

      return (
        <PieChart>
          <Pie
            data={pieData}
            dataKey="members"
            nameKey="name"
            cx="50%"
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            paddingAngle={isSolid ? 1 : 3}
            strokeWidth={2}
            stroke="hsl(var(--card))"
            label={renderPieLabel}
            labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
          >
            {pieData.map((_, i) => (
              <Cell
                key={i}
                fill={getColor(i)}
                cursor="pointer"
                opacity={selectedBar === null || selectedBar === i ? 1 : 0.35}
                onClick={() => setSelectedBar(selectedBar === i ? null : i)}
              />
            ))}
          </Pie>
          {/* Centre label — ring variants only */}
          {!isSolid && !isSemi && (
            <>
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  fill: 'hsl(var(--foreground))',
                  fontFamily: 'inherit',
                }}
              >
                {formatYAxis(total)}
              </text>
              <text
                x="50%"
                y="57%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 10, fill: '#6B7280', fontFamily: 'inherit' }}
              >
                members
              </text>
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#6B7280', paddingTop: 8 }}
            formatter={(value, entry) => (
              <span style={{ color: '#6B7280' }}>
                {value} —{' '}
                {(
                  (entry as { payload?: { members: number } }).payload?.members ?? 0
                ).toLocaleString()}
              </span>
            )}
          />
        </PieChart>
      );
    }

    // ── AREA ──────────────────────────────────────────────────────────────────
    if (activeFamily === 'area') {
      const isSolidFill = chartType === 'area-solid';
      return (
        <AreaChart data={filteredData} margin={margin}>
          {!isSolidFill && (
            <defs>
              <linearGradient id="areaGradSec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primarySeriesColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={primarySeriesColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
          )}
          <ChartGrid show={showGrid} style={gridStyle} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type={curveFor()}
            dataKey="members"
            stroke={primarySeriesColor}
            strokeWidth={1.5}
            fill={isSolidFill ? primarySeriesColor : 'url(#areaGradSec)'}
            fillOpacity={isSolidFill ? 0.15 : 1}
            dot={{ fill: primarySeriesColor, r: 2.5, strokeWidth: 0 }}
          />
        </AreaChart>
      );
    }

    // ── LINE ──────────────────────────────────────────────────────────────────
    if (activeFamily === 'line') {
      return (
        <LineChart data={filteredData} margin={margin}>
          <ChartGrid show={showGrid} style={gridStyle} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type={curveFor()}
            dataKey="members"
            stroke={primarySeriesColor}
            strokeWidth={1.5}
            dot={{ fill: primarySeriesColor, r: dotRadius, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      );
    }

    // ── BAR (clustered / stacked / 100% / horizontal) ─────────────────────────
    const isHorizontal = chartType === 'bar-horizontal';
    const isStacked100 = chartType === 'bar-100';
    const isStacked = chartType === 'bar-stacked' || isStacked100;
    const barData = isStacked100 ? filteredData.map((d) => ({ ...d, members: 100 })) : filteredData;

    return (
      <BarChart
        data={barData}
        margin={margin}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        barCategoryGap="20%"
        barGap={2}
      >
        <ChartGrid show={showGrid} style={gridStyle} />
        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              tick={axisStyle}
              axisLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
              tickLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
              tickSize={3}
              width={yAxisWidth}
              domain={[0, isStacked100 ? 100 : yDomainMax]}
              tickCount={yTickCount}
              tickFormatter={isStacked100 ? (v) => `${v}%` : formatYAxis}
              allowDataOverflow={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={axisStyle}
              axisLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
              tickLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
              width={30}
            />
          </>
        ) : (
          <>
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} tickFormatter={isStacked100 ? (v) => `${v}%` : formatYAxis} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6', opacity: 0.7 }} />
        <Bar
          dataKey="members"
          radius={isStacked ? [0, 0, 0, 0] : [2, 2, 0, 0]}
          cursor="pointer"
          maxBarSize={isHorizontal ? 22 : 48}
          stackId={isStacked ? 's' : undefined}
          onClick={(_, i) => setSelectedBar(selectedBar === i ? null : i)}
        >
          {barData.map((_, i) => (
            <Cell
              key={i}
              fill={getColor(i)}
              opacity={selectedBar === null || selectedBar === i ? 1 : 0.4}
            />
          ))}
        </Bar>
      </BarChart>
    );
  };

  const isPieOrRadar = activeFamily === 'pie';

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Membership Growth</CardTitle>
            {maxValue > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary tabular-nums">
                {maxValue.toLocaleString()} peak
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Range mode */}
            <div className="relative">
              <select
                value={rangeMode}
                onChange={(e) => setRangeMode(e.target.value as 'preset' | 'custom')}
                className="text-[9px] sm:text-[10px] lg:text-xs border border-border rounded-full px-2 sm:px-3 py-1 bg-card text-foreground cursor-pointer appearance-none pr-4 sm:pr-6"
              >
                <option value="preset">Preset</option>
                <option value="custom">Date Range</option>
              </select>
              <ChevronDown
                size={10}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
              />
            </div>

            {rangeMode === 'preset' ? (
              <div className="relative">
                <select
                  value={presetRange}
                  onChange={(e) => setPresetRange(e.target.value)}
                  className="text-[9px] sm:text-[10px] lg:text-xs border border-border rounded-full px-2 sm:px-3 py-1 bg-card text-foreground cursor-pointer appearance-none pr-4 sm:pr-6"
                >
                  <option value="all">All Time</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                  <option value="6m">6 Months</option>
                  <option value="year">This Year</option>
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="text-[9px] sm:text-[10px] border border-border rounded-full px-2 py-1 bg-card text-foreground w-[110px] sm:w-[130px]"
                />
                <span className="text-[9px] text-muted-foreground">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="text-[9px] sm:text-[10px] border border-border rounded-full px-2 py-1 bg-card text-foreground w-[110px] sm:w-[130px]"
                />
              </div>
            )}

            {/* Grid + Border toggles — hidden for pie */}
            {!isPieOrRadar && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowGrid((g) => !g)}
                  className={[
                    'text-[9px] sm:text-[10px] lg:text-xs border rounded-full px-2 sm:px-3 py-1 transition-colors',
                    showGrid
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted',
                  ].join(' ')}
                >
                  Grid
                </button>
                {showGrid && (
                  <button
                    onClick={() => setGridStyle((s) => (s === 'dashed' ? 'solid' : 'dashed'))}
                    className="text-[9px] sm:text-[10px] border border-border rounded-full px-2 sm:px-3 py-1 bg-card text-muted-foreground hover:bg-muted transition-colors"
                    title={gridStyle === 'dashed' ? 'Switch to solid' : 'Switch to dashed'}
                  >
                    {gridStyle === 'dashed' ? '- - -' : '———'}
                  </button>
                )}
                <button
                  onClick={() => setShowBorder((b) => !b)}
                  className={[
                    'text-[9px] sm:text-[10px] lg:text-xs border rounded-full px-2 sm:px-3 py-1 transition-colors',
                    showBorder
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted',
                  ].join(' ')}
                  title="Toggle chart border"
                >
                  Border
                </button>
              </div>
            )}

            {/* Colour picker */}
            <SmartDropdown
              open={showColorPicker}
              onClose={() => setShowColorPicker(false)}
              minWidth={220}
              trigger={
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="text-[9px] sm:text-[10px] lg:text-xs border border-border rounded-full px-2 sm:px-3 py-1 hover:bg-muted transition-colors flex items-center gap-1 sm:gap-1.5"
                >
                  <div className="flex -space-x-1">
                    {colors.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border border-background"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span className="hidden sm:inline">Colors</span>
                </button>
              }
            >
              <p className="text-[10px] font-semibold mb-1">Chart Colors</p>
              <p className="text-[9px] text-muted-foreground mb-2">
                Applied across all chart types
              </p>
              <div className="space-y-1.5">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c}
                      onChange={(e) => {
                        const u = [...colors];
                        u[i] = e.target.value;
                        setColors(u);
                      }}
                      className="w-6 h-6 rounded cursor-pointer border-0 shrink-0"
                    />
                    <span className="text-[10px] text-muted-foreground font-mono flex-1 truncate">
                      {c}
                    </span>
                    {colors.length > 1 && (
                      <button
                        onClick={() => setColors(colors.filter((_, j) => j !== i))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {colors.length < 8 && (
                <button
                  onClick={() => setColors([...colors, DEFAULT_COLORS[colors.length % 8]])}
                  className="mt-2 flex items-center gap-1 text-[10px] text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add color
                </button>
              )}
              {Object.keys(barColors).length > 0 && (
                <button
                  onClick={() => {
                    setBarColors({});
                    setSelectedBar(null);
                  }}
                  className="mt-2 w-full text-[10px] text-destructive font-medium hover:underline"
                >
                  Reset individual colors
                </button>
              )}
            </SmartDropdown>

            {/* ── Chart type picker — two-level, auto-sizing ── */}
            <ChartTypePicker
              value={chartType}
              onChange={(id) => {
                setChartType(id);
                setSelectedBar(null);
              }}
            />
          </div>
        </div>
      </CardHeader>

      <Separator className="-mx-0 w-full" />

      <CardContent className="pt-3">
        <div
          className="w-full rounded-sm transition-all duration-300"
          style={{
            height: chartHeight,
            background: 'hsl(var(--card))',
            border: showBorder ? '1px solid #E5E7EB' : 'none',
            padding: '6px 2px 4px 0',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        <p className="text-[9px] text-muted-foreground mt-1 pl-1">
          {usingMockData
            ? 'Demo data — log in with a church that has members, or use local activity (useLogMember) for a secondary source.'
            : hasApiGrowth
              ? `Live · new members by registration month · ${filteredData.reduce((s, d) => s + d.members, 0).toLocaleString()} in selected range (refresh dashboard to update)`
              : `Local activity · ${filteredData.reduce((s, d) => s + d.members, 0).toLocaleString()} events in view`}
        </p>

        {selectedBar !== null && (
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            Selected: {filteredData[selectedBar]?.name} —{' '}
            {filteredData[selectedBar]?.members.toLocaleString()} members
          </p>
        )}
      </CardContent>
    </Card>
  );
}
