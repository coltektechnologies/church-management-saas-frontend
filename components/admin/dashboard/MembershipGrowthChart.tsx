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
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { ChartToolbarSelect } from '@/components/admin/dashboard/ChartToolbarSelect';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SlidersHorizontal } from 'lucide-react';

const CHART_TYPES = [
  { id: 'bar', label: 'Bar' },
  { id: 'line', label: 'Line' },
  { id: 'area', label: 'Area' },
  { id: 'pie', label: 'Pie' },
];

const PLOT_OPTIONS = [
  { id: 'count', label: 'Member count' },
  { id: 'active', label: 'Active members' },
  { id: 'departments', label: 'By department' },
];

const PRESET_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: 'year', label: 'This year' },
];

const RANGE_MODE_OPTIONS = [
  { value: 'preset', label: 'Preset range' },
  { value: 'custom', label: 'Custom dates' },
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

  const seriesColors = useMemo(
    () => [pc, ac, '#E4002B', '#FFB020', '#6366F1', '#EC4899', '#14B8A6', '#F97316'],
    [pc, ac]
  );

  const [chartType, setChartType] = useState('bar');
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
    return members.filter(
      (m) => !d || (now.getTime() - new Date(m.joinedDate).getTime()) / 86400000 <= d
    );
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

  const getColor = (i: number) => seriesColors[i % seriesColors.length];

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
              <Cell key={i} fill={getColor(i)} />
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
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={getColor(i)} />
          ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    // border/shadow/radius applied by wrapper in DashboardPage
    <div className="bg-card p-3 sm:p-4 lg:p-5 h-full flex flex-col">
      {/* ── Card title + controls ── */}
      <div className="flex items-center justify-between gap-3 min-w-0 w-full shrink-0">
        <h3 className="shrink-0 min-w-0 truncate text-sm sm:text-base font-bold text-foreground tracking-tight">
          Membership Growth
        </h3>
        <Popover modal={false}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 font-medium"
            >
              <SlidersHorizontal className="size-4 opacity-80" aria-hidden />
              Options
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[min(calc(100vw-2rem),20rem)] sm:w-80 p-4 z-[2147483642]"
          >
            <p className="text-sm font-semibold text-foreground mb-4">Chart options</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Range mode</Label>
                <ChartToolbarSelect
                  fullWidth
                  value={rangeMode}
                  onValueChange={(v) => setRangeMode(v as 'preset' | 'custom')}
                  options={RANGE_MODE_OPTIONS}
                />
              </div>

              {rangeMode === 'preset' ? (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Period</Label>
                  <ChartToolbarSelect
                    fullWidth
                    value={presetRange}
                    onValueChange={setPresetRange}
                    options={PRESET_RANGE_OPTIONS}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Custom dates</Label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm text-foreground"
                    />
                    <span className="text-[11px] text-muted-foreground text-center">to</span>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm text-foreground"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Plot</Label>
                <ChartToolbarSelect
                  fullWidth
                  value={plotType}
                  onValueChange={setPlotType}
                  options={PLOT_OPTIONS.map((t) => ({ value: t.id, label: t.label }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Chart type</Label>
                <ChartToolbarSelect
                  fullWidth
                  value={chartType}
                  onValueChange={setChartType}
                  options={CHART_TYPES.map((t) => ({ value: t.id, label: t.label }))}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Horizontal rule after title + controls ── */}
      <div className="mt-3 mb-3 shrink-0" style={{ borderBottom: '1px solid #A9A9A9' }} />

      {/* ── Chart fills remaining height ── */}
      <div className="relative flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60">
            <BarChart3 size={28} className="text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No membership data yet</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Add members to see growth trends
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
