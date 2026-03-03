'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
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
import {
  Table as TableIcon,
  PieChart as PieIcon,
  LineChart as LineIcon,
  BarChart3,
} from 'lucide-react';
import { useAppData } from '@/components/dashboard/contexts/AppDataContext';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const CHART_TYPES = [
  { id: 'line', label: 'Line', icon: LineIcon },
  { id: 'bar', label: 'Bar', icon: BarChart3 },
  { id: 'area', label: 'Area', icon: LineIcon },
  { id: 'pie', label: 'Pie', icon: PieIcon },
];

const TIME_RANGES = [
  { id: 'all', label: 'All Time' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 3 Months' },
  { id: 'year', label: 'This Year' },
];

const subscribe = () => () => {};

const IncomeExpenseChart = ({ onViewDetails }: { onViewDetails?: () => void }) => {
  const { transactions } = useAppData();
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('all');
  const [showTable, setShowTable] = useState(false);

  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const incomeColor = '#2FC4B2';
  const expenseColor = '#E4002B';

  const filteredTxns = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      if (timeRange === 'all') {
        return true;
      }
      const d = new Date(t.date);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (timeRange === '7d') {
        return diff <= 7;
      }
      if (timeRange === '30d') {
        return diff <= 30;
      }
      if (timeRange === '90d') {
        return diff <= 90;
      }
      if (timeRange === 'year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, timeRange]);

  const chartData = useMemo(() => {
    const dates = [...new Set(filteredTxns.map((t) => t.date))].sort();
    return dates.map((date) => ({
      name: date.slice(5),
      income: filteredTxns
        .filter((t) => t.date === date && t.type === 'Income')
        .reduce((s, t) => s + t.amount, 0),
      expenses: filteredTxns
        .filter((t) => t.date === date && t.type === 'Expense')
        .reduce((s, t) => s + t.amount, 0),
    }));
  }, [filteredTxns]);

  if (!mounted) {
    return <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-xl" />;
  }

  const renderChart = () => {
    const commonProps = { data: chartData, margin: { top: 10, right: 10, left: -15, bottom: 0 } };

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
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            <Cell fill={incomeColor} strokeWidth={0} />
            <Cell fill={expenseColor} strokeWidth={0} />
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      );
    }

    const ChartComp = chartType === 'bar' ? BarChart : chartType === 'area' ? AreaChart : LineChart;

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
          <>
            <Line
              type="monotone"
              dataKey="income"
              stroke={incomeColor}
              strokeWidth={3}
              dot={{ r: 4, fill: incomeColor }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke={expenseColor}
              strokeWidth={3}
              dot={{ r: 4, fill: expenseColor }}
              activeDot={{ r: 6 }}
            />
          </>
        )}
        {chartType === 'bar' && (
          <>
            <Bar dataKey="income" fill={incomeColor} radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="expenses" fill={expenseColor} radius={[4, 4, 0, 0]} barSize={20} />
          </>
        )}
        {chartType === 'area' && (
          <>
            <Area
              type="monotone"
              dataKey="income"
              stroke={incomeColor}
              fill="url(#colorIncome)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke={expenseColor}
              fill="url(#colorExpense)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={incomeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={incomeColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={expenseColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={expenseColor} stopOpacity={0} />
              </linearGradient>
            </defs>
          </>
        )}
      </ChartComp>
    );
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-base font-black text-[#0B2A4A] tracking-tight">Financial Overview</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            Income vs Expenses
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl">
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
          <div className="w-[1px] h-4 bg-border mx-1" />
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

      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 text-[11px] font-black text-muted-foreground hover:text-primary transition-colors"
        >
          <TableIcon size={14} /> {showTable ? 'Hide Data' : 'Audit Table'}
        </button>
        <button
          onClick={onViewDetails}
          className="text-[11px] font-black text-primary hover:underline"
        >
          Full Report →
        </button>
      </div>

      {showTable && (
        <div className="mt-4 border border-border rounded-xl overflow-hidden animate-in slide-in-from-top-2">
          <Table>
            <TableBody>
              {chartData.map((d, i) => (
                <TableRow key={i} className="text-[11px] h-8">
                  <TableCell className="font-bold">{d.name}</TableCell>
                  <TableCell className="text-green-600 font-bold text-right">
                    +{d.income.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-red-600 font-bold text-right">
                    -{d.expenses.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenseChart;
