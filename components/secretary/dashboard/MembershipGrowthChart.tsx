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

const CHART_TYPES = [
  { id: 'bar', label: 'Bar' },
  { id: 'line', label: 'Line' },
  { id: 'area', label: 'Area' },
  { id: 'pie', label: 'Pie' },
];

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
// The base AppData activity type only guarantees a small set of fields.
// The ActivityContext also emits a `type` field (e.g. 'member_added') that
// is not part of the base interface. We extend here so we can read it without
// casting to `any`.
interface ActivityWithType {
  timestamp: string;
  tab?: string;
  entity?: string;
  action?: string;
  type?: string;
}

// ── MOCK DATA — remove this block when real member data is wired up ───────────
// This is demo data for team presentation only.
// Once the Members page is connected and activity log has real member events,
// this array will be ignored automatically (see useGrowthData below).
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
// ── END MOCK DATA ─────────────────────────────────────────────────────────────

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

// ── Live growth data derived from activity log ────────────────────────────────
function useGrowthData(
  rangeMode: 'preset' | 'custom',
  presetRange: string,
  customFrom: string,
  customTo: string
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

    const buckets: Record<string, number> = {};

    for (const a of activities as ActivityWithType[]) {
      const ts = new Date(a.timestamp).getTime();
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
        const monthIdx = parseInt(key.split('-')[1]);
        return { name: MONTH_NAMES[monthIdx], members: buckets[key] };
      });
  }, [activities, rangeMode, presetRange, customFrom, customTo]);
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
      <p style={{ color, fontWeight: 700, fontSize: 12 }}>{item?.value} members</p>
    </div>
  );
}

function renderPieLabel(props: PieLabelRenderProps) {
  return `${props.name ?? ''}: ${props.value ?? ''}`;
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

// ── Main ──────────────────────────────────────────────────────────────────────
export function MembershipGrowthChart() {
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

  const filteredData = useGrowthData(rangeMode, presetRange, customFrom, customTo);
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
    width: 32,
  };

  const { activities } = useAppData();
  const usingMockData = !(activities as ActivityWithType[]).some(isMemberActivity);

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <PieChart>
          <Pie
            data={filteredData}
            dataKey="members"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            label={renderPieLabel}
            strokeWidth={1}
            stroke="hsl(var(--card))"
          >
            {filteredData.map((_, i) => (
              <Cell
                key={i}
                fill={getColor(i)}
                cursor="pointer"
                onClick={() => setSelectedBar(selectedBar === i ? null : i)}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#6B7280' }} />
        </PieChart>
      );
    }
    if (chartType === 'line') {
      return (
        <LineChart data={filteredData} margin={margin}>
          <ChartGrid show={showGrid} style={gridStyle} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="linear"
            dataKey="members"
            stroke={primarySeriesColor}
            strokeWidth={1.5}
            dot={{ fill: primarySeriesColor, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      );
    }
    if (chartType === 'area') {
      return (
        <AreaChart data={filteredData} margin={margin}>
          <defs>
            <linearGradient id="areaGradSec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primarySeriesColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={primarySeriesColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <ChartGrid show={showGrid} style={gridStyle} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="linear"
            dataKey="members"
            stroke={primarySeriesColor}
            strokeWidth={1.5}
            fill="url(#areaGradSec)"
            dot={{ fill: primarySeriesColor, r: 2.5, strokeWidth: 0 }}
          />
        </AreaChart>
      );
    }
    return (
      <BarChart data={filteredData} margin={margin} barCategoryGap="20%" barGap={2}>
        <ChartGrid show={showGrid} style={gridStyle} />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6', opacity: 0.7 }} />
        <Bar
          dataKey="members"
          radius={[2, 2, 0, 0]}
          cursor="pointer"
          maxBarSize={48}
          onClick={(_, i) => setSelectedBar(selectedBar === i ? null : i)}
        >
          {filteredData.map((_, i) => (
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

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Membership Growth</CardTitle>
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

            {/* Grid toggle */}
            {chartType !== 'pie' && (
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

            {/* Chart type */}
            <div className="relative">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="text-[9px] sm:text-[10px] lg:text-xs border border-border rounded-full px-2 sm:px-3 py-1 bg-card text-foreground appearance-none pr-4 sm:pr-6"
              >
                {CHART_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={10}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator className="mx-4" />

      <CardContent className="pt-3">
        <div
          className="w-full rounded-sm"
          style={{
            minHeight: 200,
            height: 'clamp(200px,30vh,300px)',
            background: 'hsl(var(--card))',
            border: '1px solid #E5E7EB',
            padding: '6px 2px 4px 0',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        <p className="text-[9px] text-muted-foreground mt-1 pl-1">
          {usingMockData
            ? 'Showing demo data wire Members page with useLogMember() to see real growth'
            : 'Live data from member activity log · updates automatically'}
        </p>

        {selectedBar !== null && (
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            Selected: {filteredData[selectedBar]?.name} — {filteredData[selectedBar]?.members}{' '}
            members
          </p>
        )}
      </CardContent>
    </Card>
  );
}
