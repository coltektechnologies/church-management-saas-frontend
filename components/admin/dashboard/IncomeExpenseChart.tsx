'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { SlidersHorizontal, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { ChartToolbarSelect } from '@/components/admin/dashboard/ChartToolbarSelect';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CHART_TYPES = [
  { id: 'line', label: 'Line' },
  { id: 'bar', label: 'Bar' },
  { id: 'area', label: 'Area' },
  { id: 'pie', label: 'Pie' },
];

const INCOME_PRESET_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'year', label: 'This year' },
];

const RANGE_MODE_OPTIONS = [
  { value: 'preset', label: 'Preset range' },
  { value: 'custom', label: 'Custom dates' },
];

const X_AXIS_OPTIONS = [
  { value: 'date', label: 'By month' },
  { value: 'category', label: 'By category' },
];

const PLACEHOLDER_DATA = [
  { name: 'Jan', income: 3000, expenses: 1200 },
  { name: 'Feb', income: 4500, expenses: 2000 },
  { name: 'Mar', income: 3800, expenses: 1500 },
  { name: 'Apr', income: 5200, expenses: 2800 },
  { name: 'May', income: 4000, expenses: 1800 },
];

const fmtCurrency = (v: number | undefined) => `₵${(v ?? 0).toLocaleString()}`;

export default function IncomeExpenseChart() {
  const router = useRouter();
  const { transactions } = useAppData();
  const { profile } = useChurchProfile();
  const incomeColor = profile.accentColor || '#10B981';
  const expenseColor = profile.primaryColor || '#F87171';

  const [chartType, setChartType] = useState('line');
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
  const [presetRange, setPresetRange] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [xAxis, setXAxis] = useState<'date' | 'category'>('date');
  const [showTable, setShowTable] = useState(false);

  const hasData = transactions.length > 0;

  const filteredTxns = useMemo(() => {
    if (!hasData) {
      return [];
    }
    if (rangeMode === 'custom') {
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(customTo) : null;
      return transactions.filter((t) => {
        const d = new Date(t.date);
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
      '7d': 7,
      '30d': 30,
      '90d': 90,
      year: 365,
    };
    const d = days[presetRange] ?? null;
    return transactions.filter(
      (t) => !d || (now.getTime() - new Date(t.date).getTime()) / 86400000 <= d
    );
  }, [transactions, rangeMode, presetRange, customFrom, customTo, hasData]);

  const chartData = useMemo(() => {
    if (!hasData) {
      return PLACEHOLDER_DATA;
    }
    if (xAxis === 'category') {
      const cats = [...new Set(filteredTxns.map((t) => t.category))];
      return cats.map((cat) => ({
        name: cat,
        income: filteredTxns
          .filter((t) => t.category === cat && t.type === 'Income')
          .reduce((s, t) => s + t.amount, 0),
        expenses: filteredTxns
          .filter((t) => t.category === cat && t.type === 'Expense')
          .reduce((s, t) => s + t.amount, 0),
      }));
    }
    const monthMap: Record<string, { income: number; expenses: number }> = {};
    filteredTxns.forEach((t) => {
      const key = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthMap[key]) {
        monthMap[key] = { income: 0, expenses: 0 };
      }
      if (t.type === 'Income') {
        monthMap[key].income += t.amount;
      }
      if (t.type === 'Expense') {
        monthMap[key].expenses += t.amount;
      }
    });
    return Object.entries(monthMap).map(([name, vals]) => ({ name, ...vals }));
  }, [filteredTxns, xAxis, hasData]);

  const fillOpacity = hasData ? 1 : 0.15;

  const renderChart = () => {
    const common = { data: chartData, margin: { top: 5, right: 10, left: -10, bottom: 5 } };

    if (chartType === 'pie') {
      const pieData = [
        { name: 'Income', value: chartData.reduce((s, d) => s + d.income, 0) },
        { name: 'Expenses', value: chartData.reduce((s, d) => s + d.expenses, 0) },
      ];
      return (
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={
              hasData
                ? ({ name, value }: { name?: string; value?: number }) =>
                    `${name ?? ''}: ₵${(value ?? 0).toLocaleString()}`
                : undefined
            }
            opacity={fillOpacity}
          >
            <Cell fill={incomeColor} />
            <Cell fill={expenseColor} />
          </Pie>
          <Tooltip formatter={fmtCurrency} />
          {hasData && <Legend />}
        </PieChart>
      );
    }
    if (chartType === 'bar') {
      return (
        <BarChart {...common}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={fmtCurrency} />
          <Legend />
          <Bar
            dataKey="income"
            name="Income"
            radius={[4, 4, 0, 0]}
            fillOpacity={fillOpacity}
            fill={incomeColor}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            radius={[4, 4, 0, 0]}
            fillOpacity={fillOpacity}
            fill={expenseColor}
          />
        </BarChart>
      );
    }
    if (chartType === 'area') {
      return (
        <AreaChart {...common}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={fmtCurrency} />
          <Legend />
          <Area
            type="monotone"
            dataKey="income"
            stroke={incomeColor}
            fill={incomeColor}
            fillOpacity={hasData ? 0.15 : 0.05}
            name="Income"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke={expenseColor}
            fill={expenseColor}
            fillOpacity={hasData ? 0.15 : 0.05}
            name="Expenses"
          />
        </AreaChart>
      );
    }
    return (
      <LineChart {...common}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={fmtCurrency} />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke={incomeColor}
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Income"
          strokeOpacity={hasData ? 1 : 0.2}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke={expenseColor}
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Expenses"
          strokeOpacity={hasData ? 1 : 0.2}
        />
      </LineChart>
    );
  };

  return (
    // border/shadow/radius applied by wrapper in DashboardPage
    <div className="bg-card p-3 sm:p-4 lg:p-5 h-full flex flex-col">
      {/* ── Card title + controls ── */}
      <div className="flex items-center justify-between gap-3 min-w-0 w-full shrink-0">
        <h3 className="shrink-0 min-w-0 truncate text-sm sm:text-base font-bold text-foreground tracking-tight">
          Income vs Expense
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
                    options={INCOME_PRESET_OPTIONS}
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
                <Label className="text-xs text-muted-foreground">Breakdown</Label>
                <ChartToolbarSelect
                  fullWidth
                  value={xAxis}
                  onValueChange={(v) => setXAxis(v as 'date' | 'category')}
                  options={X_AXIS_OPTIONS}
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
            <TrendingUp size={28} className="text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No transaction data yet</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Add income/expenses to see trends
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-2 shrink-0">
        <button
          onClick={() => setShowTable(!showTable)}
          className="text-[10px] sm:text-xs text-muted-foreground font-medium hover:underline"
        >
          {showTable ? 'Hide' : 'Show'} data table
        </button>
        <button
          onClick={() => router.push('/admin/treasury')}
          className="text-[10px] sm:text-xs text-primary font-medium hover:underline"
        >
          View details
        </button>
      </div>

      {/* Inline data table */}
      {showTable && (
        <div className="mt-3 border border-border rounded-lg overflow-hidden max-h-[140px] overflow-y-auto shrink-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">{xAxis === 'date' ? 'Month' : 'Category'}</TableHead>
                <TableHead className="text-xs text-right">Income</TableHead>
                <TableHead className="text-xs text-right">Expenses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartData.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">{d.name}</TableCell>
                  <TableCell className="text-xs text-right">₵{d.income.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-right">
                    ₵{d.expenses.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
