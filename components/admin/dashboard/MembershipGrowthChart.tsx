'use client';

import { useState, useMemo } from 'react';
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
  type BarRectangleItem,
} from 'recharts';
import { ChevronDown, BarChart3, Plus, Trash2 } from 'lucide-react';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/contexts/ChurchProfileContext';

const CHART_TYPES = [
  { id: 'bar', label: 'Bar' },
  { id: 'line', label: 'Line' },
  { id: 'area', label: 'Area' },
  { id: 'pie', label: 'Pie' },
];

const PLOT_OPTIONS = [
  { id: 'count', label: 'Member Count' },
  { id: 'active', label: 'Active Members' },
  { id: 'departments', label: 'By Department' },
];

const PLACEHOLDER_DATA = [
  { name: 'Jan', members: 12 },
  { name: 'Feb', members: 18 },
  { name: 'Mar', members: 14 },
  { name: 'Apr', members: 22 },
  { name: 'May', members: 28 },
  { name: 'Jun', members: 24 },
];

export default function MembershipGrowthChart() {
  const { members, departments } = useAppData();
  const { profile } = useChurchProfile();
  const pc = profile.primaryColor || '#0B2A4A';
  const ac = profile.accentColor || '#2FC4B2';

  const DEFAULT_COLORS = [pc, ac, '#E4002B', '#FFB020', '#6366F1', '#EC4899', '#14B8A6', '#F97316'];

  const [chartType, setChartType] = useState('bar');
  const [colors, setColors] = useState([pc, ac]);
  const [barColors, setBarColors] = useState<Record<number, string>>({});
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [plotType, setPlotType] = useState('count');
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
  const [presetRange, setPresetRange] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const hasData = members.length > 0;

  const filteredMembers = useMemo(() => {
    if (!hasData) {
      return [];
    }

    if (rangeMode === 'custom') {
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(customTo) : null;
      return members.filter((m) => {
        const d = new Date(m.joinedDate);
        if (from && d < from) {
          return false;
        }
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          if (d > end) {
            return false;
          }
        }
        return true;
      });
    }

    const now = new Date();
    const days: Record<string, number | null> = {
      all: null,
      '30d': 30,
      '90d': 90,
      '6m': 180,
      year: 365,
    };
    const d = days[presetRange] ?? null;
    return members.filter((m) => {
      if (!d) {
        return true;
      }
      return (now.getTime() - new Date(m.joinedDate).getTime()) / 86400000 <= d;
    });
  }, [members, rangeMode, presetRange, customFrom, customTo, hasData]);

  const chartData = useMemo(() => {
    if (!hasData) {
      return PLACEHOLDER_DATA;
    }

    if (plotType === 'departments') {
      return departments.map((d) => ({
        name: d.name,
        members: members.filter((m) => m.department === d.name).length || d.members,
      }));
    }

    const monthMap: Record<string, number> = {};
    filteredMembers.forEach((m) => {
      const key = new Date(m.joinedDate).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      if (plotType === 'active' && m.status !== 'Active') {
        return;
      }
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    return Object.entries(monthMap).map(([name, members]) => ({ name, members }));
  }, [filteredMembers, departments, members, plotType, hasData]);

  const fillOpacity = hasData ? 1 : 0.15;
  const strokeOpacity = hasData ? 1 : 0.2;

  const addColor = () => {
    if (colors.length < 8) {
      setColors([...colors, DEFAULT_COLORS[colors.length % 8]]);
    }
  };
  const removeColor = (i: number) => {
    if (colors.length > 1) {
      setColors(colors.filter((_, j) => j !== i));
    }
  };
  const updateColor = (i: number, v: string) => {
    const u = [...colors];
    u[i] = v;
    setColors(u);
  };
  const getColor = (i: number) => barColors[i] ?? colors[i % colors.length];

  const renderChart = () => {
    const common = { data: chartData, margin: { top: 5, right: 10, left: -10, bottom: 5 } };

    if (chartType === 'pie') {
      return (
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="members"
            label={
              hasData
                ? ({ name, payload }: PieLabelRenderProps) =>
                    `${name ?? ''}: ${(payload as { members?: number })?.members ?? ''}`
                : undefined
            }
            opacity={fillOpacity}
          >
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={getColor(i)}
                cursor="pointer"
                onClick={() => setSelectedBar(selectedBar === i ? null : i)}
              />
            ))}
          </Pie>
          <Tooltip />
          {hasData && <Legend />}
        </PieChart>
      );
    }

    if (chartType === 'line') {
      return (
        <LineChart {...common}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="members"
            stroke={getColor(0)}
            strokeWidth={2}
            dot={{ r: 3, fill: getColor(1) }}
            name="Members"
            strokeOpacity={strokeOpacity}
          />
        </LineChart>
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart {...common}>
          <defs>
            <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getColor(0)} stopOpacity={0.3} />
              <stop offset="95%" stopColor={getColor(1)} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="members"
            stroke={getColor(0)}
            fill="url(#memberGrad)"
            fillOpacity={fillOpacity}
            strokeOpacity={strokeOpacity}
            name="Members"
          />
        </AreaChart>
      );
    }

    // Bar (default)
    return (
      <BarChart {...common}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar
          dataKey="members"
          radius={[4, 4, 0, 0]}
          barSize={36}
          name="Members"
          fillOpacity={fillOpacity}
          onClick={(_: BarRectangleItem, i: number) => setSelectedBar(selectedBar === i ? null : i)}
          cursor="pointer"
        >
          {chartData.map((_, i) => (
            <Cell
              key={i}
              fill={getColor(i)}
              stroke={selectedBar === i ? 'hsl(var(--primary))' : 'none'}
              strokeWidth={selectedBar === i ? 2 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border p-3 sm:p-4 lg:p-5">
      {/* Controls */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
        <h3 className="text-xs sm:text-sm lg:text-base font-bold text-foreground">
          Membership Growth
        </h3>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {/* Range mode */}
          <div className="relative">
            <select
              value={rangeMode}
              onChange={(e) => setRangeMode(e.target.value as 'preset' | 'custom')}
              className="text-[9px] sm:text-[10px] lg:text-xs border border-border rounded-full px-2 sm:px-3 py-1 bg-card text-foreground cursor-pointer appearance-none pr-4 sm:pr-6"
            >
              <option value="preset">Preset</option>
              <option value="custom">Custom days</option>
            </select>
            <ChevronDown
              size={10}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
            />
          </div>

          {/* Preset options OR custom date inputs */}
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
                className="text-[9px] sm:text-[10px] border border-border rounded-full px-2 py-1 bg-card text-foreground cursor-pointer w-[110px] sm:w-[130px]"
              />
              <span className="text-[9px] text-muted-foreground">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="text-[9px] sm:text-[10px] border border-border rounded-full px-2 py-1 bg-card text-foreground cursor-pointer w-[110px] sm:w-[130px]"
              />
            </div>
          )}

          {/* Plot type */}
          <div className="relative">
            <select
              value={plotType}
              onChange={(e) => setPlotType(e.target.value)}
              className="text-[9px] sm:text-[10px] lg:text-xs border border-border rounded-full px-2 sm:px-3 py-1 bg-card text-foreground cursor-pointer appearance-none pr-4 sm:pr-6"
            >
              {PLOT_OPTIONS.map((t) => (
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

          {/* Colors */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="text-[9px] sm:text-[10px] lg:text-xs border border-border rounded-full px-2 sm:px-3 py-1 hover:bg-muted transition-colors flex items-center gap-1"
            >
              <div className="flex -space-x-1">
                {colors.slice(0, 3).map((c, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-background"
                    style={{ backgroundColor: c }}
                  />
                ))}
                {colors.length > 3 && (
                  <span className="text-[8px] text-muted-foreground ml-1">
                    +{colors.length - 3}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Colors</span>
            </button>
            {showColorPicker && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg p-3 shadow-lg z-20 min-w-[200px] max-w-[240px]">
                <p className="text-[10px] font-semibold text-foreground mb-2">Default Colors</p>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c}
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 shrink-0"
                      />
                      <span className="text-[10px] font-mono text-muted-foreground flex-1">
                        {c}
                      </span>
                      {colors.length > 1 && (
                        <button
                          onClick={() => removeColor(i)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {colors.length < 8 && (
                  <button
                    onClick={addColor}
                    className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] text-primary font-medium hover:bg-primary/5 rounded py-1"
                  >
                    <Plus size={12} /> Add color
                  </button>
                )}
                {selectedBar !== null && (
                  <div className="mt-3 pt-2 border-t border-border">
                    <p className="text-[10px] font-semibold text-foreground mb-1">
                      Bar #{selectedBar + 1}: {chartData[selectedBar]?.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={getColor(selectedBar)}
                        onChange={(e) =>
                          setBarColors((prev) => ({ ...prev, [selectedBar]: e.target.value }))
                        }
                        className="w-6 h-6 rounded cursor-pointer border-0 shrink-0"
                      />
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {getColor(selectedBar)}
                      </span>
                    </div>
                  </div>
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
              </div>
            )}
          </div>

          {/* Chart type */}
          <div className="relative">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="text-[9px] sm:text-[10px] lg:text-xs border border-border rounded-full px-2 sm:px-3 py-1 bg-card text-foreground cursor-pointer appearance-none pr-4 sm:pr-6"
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

      {/* Chart */}
      <div className="relative h-[180px] sm:h-[220px] lg:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 rounded-lg">
            <BarChart3 size={28} className="text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No membership data yet</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Add members to see growth trends
            </p>
          </div>
        )}
      </div>

      {selectedBar !== null && hasData && (
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Selected:{' '}
          <span className="font-medium text-foreground">{chartData[selectedBar]?.name}</span> —
          click bar to change its color
        </p>
      )}
    </div>
  );
}
