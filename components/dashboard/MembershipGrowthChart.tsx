'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
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
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useAppData } from '@/components/dashboard/contexts/AppDataContext';

const CHART_TYPES = [
  { id: 'bar', label: 'Bar' },
  { id: 'line', label: 'Line' },
  { id: 'area', label: 'Area' },
  { id: 'pie', label: 'Pie' },
];

const TIME_RANGES = [
  { id: 'all', label: 'All Time' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 3 Months' },
  { id: '6m', label: 'Last 6 Months' },
  { id: 'year', label: 'This Year' },
];

const PLOT_OPTIONS = [
  { id: 'count', label: 'Total Growth' },
  { id: 'active', label: 'Active Only' },
  { id: 'departments', label: 'By Department' },
];

const COLORS = ['#0B2A4A', '#2FC4B2', '#E4002B', '#FFB020', '#6366F1'];

const subscribe = () => () => {};

const MembershipGrowthChart = () => {
  const { members, departments } = useAppData();
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('all');
  const [plotType, setPlotType] = useState('count');

  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const barColor = '#0B2A4A';

  const chartData = useMemo(() => {
    if (plotType === 'departments') {
      return departments.map((d) => ({
        name: d.name,
        members: members.filter((m) => m.department === d.name).length || d.members,
      }));
    }

    const now = new Date();
    const filtered = members.filter((m) => {
      if (timeRange === 'all') {
        return true;
      }
      const d = new Date(m.joinedDate);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (timeRange === '30d') {
        return diff <= 30;
      }
      if (timeRange === '90d') {
        return diff <= 90;
      }
      if (timeRange === '6m') {
        return diff <= 180;
      }
      if (timeRange === 'year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const monthMap: Record<string, number> = {};
    filtered.forEach((m) => {
      const d = new Date(m.joinedDate);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (plotType === 'active' && m.status !== 'Active') {
        return;
      }
      monthMap[key] = (monthMap[key] || 0) + 1;
    });

    return Object.entries(monthMap).map(([name, members]) => ({ name, members }));
  }, [members, departments, timeRange, plotType]);

  if (!mounted) {
    return <div className="h-[350px] w-full bg-muted/20 animate-pulse rounded-xl" />;
  }

  const renderChart = () => {
    const commonProps = { data: chartData, margin: { top: 10, right: 10, left: -25, bottom: 0 } };

    if (chartType === 'pie') {
      return (
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="members"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <Legend iconType="circle" />
        </PieChart>
      );
    }

    const ChartComp =
      chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;

    return (
      <ChartComp {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#64748B' }}
          dy={10}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
        <Tooltip
          cursor={{ fill: '#F1F5F9' }}
          contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
        />
        {chartType === 'line' && (
          <Line
            type="monotone"
            dataKey="members"
            stroke={barColor}
            strokeWidth={3}
            dot={{ r: 4, fill: barColor }}
          />
        )}
        {chartType === 'area' && (
          <Area
            type="monotone"
            dataKey="members"
            stroke={barColor}
            fill={barColor}
            fillOpacity={0.1}
          />
        )}
        {chartType === 'bar' && (
          <Bar dataKey="members" fill={barColor} radius={[4, 4, 0, 0]} barSize={30} />
        )}
      </ChartComp>
    );
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-[#0B2A4A] tracking-tight">
              Membership Trends
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Growth Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl">
          <select
            value={plotType}
            onChange={(e) => setPlotType(e.target.value)}
            className="text-[11px] font-bold bg-transparent outline-none cursor-pointer px-2"
          >
            {PLOT_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="w-[1px] h-4 bg-border" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-[11px] font-bold bg-transparent outline-none cursor-pointer px-2"
          >
            {TIME_RANGES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="w-[1px] h-4 bg-border" />
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="text-[11px] font-bold bg-transparent outline-none cursor-pointer px-2"
          >
            {CHART_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MembershipGrowthChart;
