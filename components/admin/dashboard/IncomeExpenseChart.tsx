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
import { ChevronDown, TrendingUp, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/components/admin/dashboard/contexts/AppDataContext';
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

  const [chartType, setChartType] = useState('line');
  const [incomeColor, setIncomeColor] = useState('#10B981');
  const [expenseColor, setExpenseColor] = useState('#F87171');
  const [barIncomeColors, setBarIncomeColors] = useState<Record<number, string>>({});
  const [barExpenseColors, setBarExpenseColors] = useState<Record<number, string>>({});
  const [selectedBar, setSelectedBar] = useState<{
    index: number;
    series: 'income' | 'expenses';
  } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
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
  const getIncomeColor = (i: number) => barIncomeColors[i] ?? incomeColor;
  const getExpenseColor = (i: number) => barExpenseColors[i] ?? expenseColor;

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
            cursor="pointer"
            onClick={(_: unknown, i: number) => setSelectedBar({ index: i, series: 'income' })}
          >
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={getIncomeColor(i)}
                stroke={
                  selectedBar?.index === i && selectedBar.series === 'income'
                    ? 'hsl(var(--primary))'
                    : 'none'
                }
                strokeWidth={selectedBar?.index === i && selectedBar.series === 'income' ? 2 : 0}
              />
            ))}
          </Bar>
          <Bar
            dataKey="expenses"
            name="Expenses"
            radius={[4, 4, 0, 0]}
            fillOpacity={fillOpacity}
            cursor="pointer"
            onClick={(_: unknown, i: number) => setSelectedBar({ index: i, series: 'expenses' })}
          >
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={getExpenseColor(i)}
                stroke={
                  selectedBar?.index === i && selectedBar.series === 'expenses'
                    ? 'hsl(var(--primary))'
                    : 'none'
                }
                strokeWidth={selectedBar?.index === i && selectedBar.series === 'expenses' ? 2 : 0}
              />
            ))}
          </Bar>
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
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
        <h3 className="text-xs sm:text-sm lg:text-base font-bold text-foreground">
          Income vs Expense
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
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
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

          {/* X-axis */}
          <div className="relative">
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value as 'date' | 'category')}
              className="text-[9px] sm:text-[10px] lg:text-xs border border-border rounded-full px-2 sm:px-3 py-1 bg-card text-foreground cursor-pointer appearance-none pr-4 sm:pr-6"
            >
              <option value="date">By Month</option>
              <option value="category">By Category</option>
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
              <div className="flex gap-1">
                <span
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                  style={{ backgroundColor: incomeColor }}
                />
                <span
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                  style={{ backgroundColor: expenseColor }}
                />
              </div>
              <span className="hidden sm:inline">Colors</span>
            </button>
            {showColorPicker && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg p-3 shadow-lg z-20 min-w-[180px]">
                <label className="text-[10px] font-medium text-foreground flex items-center justify-between gap-2 mb-1.5">
                  Income
                  <input
                    type="color"
                    value={incomeColor}
                    onChange={(e) => setIncomeColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                </label>
                <label className="text-[10px] font-medium text-foreground flex items-center justify-between gap-2">
                  Expenses
                  <input
                    type="color"
                    value={expenseColor}
                    onChange={(e) => setExpenseColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                </label>
                {selectedBar && (
                  <div className="mt-3 pt-2 border-t border-border">
                    <p className="text-[10px] font-semibold text-foreground mb-1">
                      {selectedBar.series === 'income' ? 'Income' : 'Expense'} Bar #
                      {selectedBar.index + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          selectedBar.series === 'income'
                            ? getIncomeColor(selectedBar.index)
                            : getExpenseColor(selectedBar.index)
                        }
                        onChange={(e) => {
                          if (selectedBar.series === 'income') {
                            setBarIncomeColors((p) => ({
                              ...p,
                              [selectedBar.index]: e.target.value,
                            }));
                          } else {
                            setBarExpenseColors((p) => ({
                              ...p,
                              [selectedBar.index]: e.target.value,
                            }));
                          }
                        }}
                        className="w-6 h-6 rounded cursor-pointer border-0 shrink-0"
                      />
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {selectedBar.series === 'income'
                          ? getIncomeColor(selectedBar.index)
                          : getExpenseColor(selectedBar.index)}
                      </span>
                    </div>
                  </div>
                )}
                {(Object.keys(barIncomeColors).length > 0 ||
                  Object.keys(barExpenseColors).length > 0) && (
                  <button
                    onClick={() => {
                      setBarIncomeColors({});
                      setBarExpenseColors({});
                      setSelectedBar(null);
                    }}
                    className="mt-2 w-full text-[10px] text-destructive font-medium hover:underline flex items-center justify-center gap-1"
                  >
                    <Trash2 size={11} /> Reset individual colors
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
