'use client';

/**
 * IncomeExpenseChart.tsx
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import DateRangePanel, {
  TREASURY_PRESETS,
  resolveTreasuryPreset,
  type TreasuryDateRange,
} from '@/components/treasurydashboard/dashboard/chartOptions/DateRangePanel';

// ── Types ─────────────────────────────────────────────────────────────────────
interface IncomeRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  incomeType: string;
  memberName: string;
  receiptNumber: string;
  recordedAt: string;
  recordedBy: string;
  paymentMethod: string;
  paymentDetail?: string;
  notification: string[];
  incomeTypeDetail?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function autoText(hex: string): string {
  const h = (hex || '#ffffff').replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
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

const MONTHS_SHORT = [
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

function parseDMY(s: string): Date | null {
  const parts = s?.split('/');
  if (!parts || parts.length !== 3) {
    return null;
  }
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) {
    return null;
  }
  return new Date(y, m - 1, d);
}

// ── Dummy expense data (monthly, GHS) ────────────────────────────────────────
const DUMMY_EXPENSE_BY_MONTH: Record<number, number> = {
  0: 3200,
  1: 4100,
  2: 3800,
  3: 5200,
  4: 4600,
  5: 5800,
  6: 4900,
  7: 5100,
  8: 4700,
  9: 6200,
  10: 5500,
  11: 7800,
};

// ── localStorage reader ───────────────────────────────────────────────────────
const INCOME_RECORDS_KEY = 'treasury_income_records_v1';

function loadIncomeRecords(): IncomeRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(INCOME_RECORDS_KEY);
    return raw ? (JSON.parse(raw) as IncomeRecord[]) : [];
  } catch {
    return [];
  }
}

// ── Build monthly chart data ──────────────────────────────────────────────────
function buildChartData(
  records: IncomeRecord[],
  range: TreasuryDateRange,
  year: number
): { month: string; income: number; expense: number }[] {
  return MONTHS_SHORT.map((month, mi) => {
    const monthDate = new Date(year, mi, 1);
    const fromDate = range.from ? new Date(range.from) : null;
    const toDate = range.to ? new Date(range.to) : null;

    if (fromDate && monthDate < new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)) {
      return null;
    }
    if (toDate && monthDate > new Date(toDate.getFullYear(), toDate.getMonth(), 1)) {
      return null;
    }

    const income = records.reduce((sum, r) => {
      const d = parseDMY(r.date);
      if (!d) {
        return sum;
      }
      return d.getFullYear() === year && d.getMonth() === mi
        ? sum + (r.currency === 'GHS' ? r.amount : 0)
        : sum;
    }, 0);

    const expense = DUMMY_EXPENSE_BY_MONTH[mi] ?? 0;
    return { month, income, expense };
  }).filter(Boolean) as { month: string; income: number; expense: number }[];
}

// ── Persistence for preferences ───────────────────────────────────────────────
const PREFS_KEY = 'iec_prefs_v1';

interface IECPrefs {
  chartType: 'line' | 'area' | 'bar';
  rangeMode: 'preset' | 'range';
  preset: string;
  customFrom: string;
  customTo: string;
  showGrid: boolean;
  incomeColor: string;
  expenseColor: string;
}

const DEFAULT_INCOME_COLOR = '#2FC4B2';
const DEFAULT_EXPENSE_COLOR = '#F76D6F';

const DEFAULT_PREFS: IECPrefs = {
  chartType: 'line',
  rangeMode: 'preset',
  preset: 'all',
  customFrom: '',
  customTo: '',
  showGrid: true,
  incomeColor: DEFAULT_INCOME_COLOR,
  expenseColor: DEFAULT_EXPENSE_COLOR,
};

function loadPrefs(): IECPrefs {
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

function savePrefs(p: IECPrefs) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
  cardBg,
  textColor,
  incomeColor,
  expenseColor,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  cardBg: string;
  textColor: string;
  incomeColor: string;
  expenseColor: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div
      style={{
        background: cardBg,
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        fontFamily: "'Poppins', sans-serif",
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
              backgroundColor: item.name === 'income' ? incomeColor : expenseColor,
              flexShrink: 0,
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 11, color: `${textColor}70`, textTransform: 'capitalize' }}>
            {item.name}
          </span>
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

// ── Color Picker Row ──────────────────────────────────────────────────────────
function ColorPickerRow({
  label,
  color,
  defaultColor,
  onChange,
  onReset,
  textColor,
  borderColor,
}: {
  label: string;
  color: string;
  defaultColor: string;
  onChange: (c: string) => void;
  onReset: () => void;
  textColor: string;
  borderColor: string;
}) {
  const isDefault = color.toLowerCase() === defaultColor.toLowerCase();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 10,
        border: `1px solid ${color}30`,
        backgroundColor: `${color}08`,
        transition: 'all 0.15s',
      }}
    >
      {/* Clickable color swatch */}
      <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: color,
            border: `2px solid ${color}60`,
            boxShadow: `0 2px 8px ${color}50`,
            transition: 'all 0.15s',
          }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
            width: '100%',
            height: '100%',
          }}
        />
      </label>

      {/* Label + hex */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: textColor,
            fontFamily: "'Poppins', sans-serif",
            textTransform: 'capitalize',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 9,
            color: `${textColor}50`,
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            marginTop: 1,
          }}
        >
          {color.toUpperCase()}
        </div>
      </div>

      {/* Reset — only visible when color differs from default */}
      {!isDefault && (
        <button
          type="button"
          onClick={onReset}
          title="Reset to default"
          style={{
            flexShrink: 0,
            padding: '3px 9px',
            borderRadius: 6,
            border: `1px solid ${borderColor}`,
            backgroundColor: 'transparent',
            color: `${textColor}55`,
            fontSize: 9,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: '0.04em',
            transition: 'all 0.1s',
          }}
        >
          RESET
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function IncomeExpenseChart() {
  const { profile, isReady } = useTreasuryProfile();

  const isDark = isReady ? profile.darkMode : false;
  const cardBg = isDark ? profile.darkBackgroundColor || '#0A1628' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const textColor = autoText(cardBg);
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';

  // ── Prefs (includes persisted colors) ────────────────────────────────────
  const [prefs, setPrefsRaw] = useState<IECPrefs>(() =>
    typeof window !== 'undefined' ? loadPrefs() : DEFAULT_PREFS
  );

  const [showDatePanel, setShowDatePanel] = useState(false);
  const [showColorPanel, setShowColorPanel] = useState(false);

  const setPrefs = useCallback((updater: (prev: IECPrefs) => IECPrefs) => {
    setPrefsRaw((prev) => {
      const next = updater(prev);
      savePrefs(next);
      return next;
    });
  }, []);

  const {
    chartType,
    rangeMode,
    preset,
    customFrom,
    customTo,
    showGrid,
    incomeColor,
    expenseColor,
  } = prefs;

  // ── Income records ────────────────────────────────────────────────────────
  const [records, setRecords] = useState<IncomeRecord[]>(() => loadIncomeRecords());

  useEffect(() => {
    const id = setInterval(() => {
      setRecords(loadIncomeRecords());
    }, 3000);
    return () => {
      clearInterval(id);
    };
  }, []);

  // ── Active date range ─────────────────────────────────────────────────────
  const activeRange = useMemo<TreasuryDateRange>(() => {
    if (rangeMode === 'range') {
      return { from: customFrom, to: customTo };
    }
    return resolveTreasuryPreset(preset);
  }, [rangeMode, preset, customFrom, customTo]);

  const chartYear = useMemo(() => new Date().getFullYear(), []);
  const chartData = useMemo(
    () => buildChartData(records, activeRange, chartYear),
    [records, activeRange, chartYear]
  );

  const totalIncome = chartData.reduce((s, d) => s + d.income, 0);
  const totalExpense = chartData.reduce((s, d) => s + d.expense, 0);
  const net = totalIncome - totalExpense;

  const rangeLabel =
    rangeMode === 'preset'
      ? (TREASURY_PRESETS.find((p) => p.value === preset)?.label ?? 'All Time')
      : customFrom && customTo
        ? `${customFrom} → ${customTo}`
        : 'Custom Range';

  const axisStyle = { fontSize: 10, fill: `${textColor}60`, fontFamily: "'Poppins', sans-serif" };
  const gridProps = showGrid ? { stroke: `${textColor}12`, strokeDasharray: '3 3' } : undefined;

  const tooltipContent = (props: Record<string, unknown>) => (
    <ChartTooltip
      {...(props as Parameters<typeof ChartTooltip>[0])}
      cardBg={cardBg}
      textColor={textColor}
      incomeColor={incomeColor}
      expenseColor={expenseColor}
    />
  );

  const commonAxes = (
    <>
      <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
      <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmtY} width={44} />
      <Tooltip content={tooltipContent} />
      <Legend
        verticalAlign="bottom"
        wrapperStyle={{ fontSize: 10, fontFamily: "'Poppins', sans-serif", paddingTop: 8 }}
        formatter={(v) => (
          <span style={{ color: textColor, fontSize: 10, textTransform: 'capitalize' }}>{v}</span>
        )}
      />
    </>
  );

  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="iec-income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={incomeColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={incomeColor} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="iec-expense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={expenseColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={expenseColor} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          {gridProps && <CartesianGrid {...gridProps} />}
          {commonAxes}
          <Area
            type="monotone"
            dataKey="income"
            stroke={incomeColor}
            strokeWidth={2}
            fill="url(#iec-income)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke={expenseColor}
            strokeWidth={2}
            fill="url(#iec-expense)"
            fillOpacity={1}
          />
        </AreaChart>
      );
    }
    if (chartType === 'bar') {
      return (
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          {gridProps && <CartesianGrid {...gridProps} />}
          {commonAxes}
          <Bar dataKey="income" fill={incomeColor} radius={[3, 3, 0, 0]} />
          <Bar dataKey="expense" fill={expenseColor} radius={[3, 3, 0, 0]} />
        </BarChart>
      );
    }
    // Default: line
    return (
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        {gridProps && <CartesianGrid {...gridProps} />}
        {commonAxes}
        <Line
          type="monotone"
          dataKey="income"
          stroke={incomeColor}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke={expenseColor}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    );
  };

  const pillBase: React.CSSProperties = {
    padding: '5px 12px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.15s',
    border: `1px solid ${borderColor}`,
    backgroundColor: 'transparent',
    color: `${textColor}70`,
  };
  const pillActive: React.CSSProperties = {
    ...pillBase,
    border: `1px solid ${accentColor}`,
    backgroundColor: `${accentColor}15`,
    color: accentColor,
  };

  return (
    <div
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 380,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: textColor,
              margin: 0,
            }}
          >
            Income vs Expense
          </h3>
          <p
            style={{
              fontSize: 11,
              color: `${textColor}55`,
              margin: '2px 0 0',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {chartData.length} month{chartData.length !== 1 ? 's' : ''} · {rangeLabel}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Chart type pills */}
          {(['line', 'area', 'bar'] as const).map((ct) => (
            <button
              key={ct}
              onClick={() => setPrefs((p) => ({ ...p, chartType: ct }))}
              style={chartType === ct ? pillActive : pillBase}
            >
              {ct.charAt(0).toUpperCase() + ct.slice(1)}
            </button>
          ))}

          {/* Date range pill */}
          <button
            onClick={() => {
              setShowDatePanel((p) => !p);
              setShowColorPanel(false);
            }}
            style={showDatePanel ? pillActive : pillBase}
          >
            {rangeLabel}
          </button>

          {/* Colors pill — shows live color preview dots */}
          <button
            onClick={() => {
              setShowColorPanel((p) => !p);
              setShowDatePanel(false);
            }}
            style={{
              ...(showColorPanel ? pillActive : pillBase),
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: incomeColor,
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: expenseColor,
                  display: 'inline-block',
                }}
              />
            </span>
            Colors
          </button>
        </div>
      </div>

      {/* ── Date Range Panel ── */}
      {showDatePanel && (
        <div
          style={{
            padding: '14px 16px',
            marginBottom: 14,
            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#FAFBFC',
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
          }}
        >
          <DateRangePanel
            mode={rangeMode}
            preset={preset}
            customFrom={customFrom}
            customTo={customTo}
            onMode={(v) => setPrefs((p) => ({ ...p, rangeMode: v }))}
            onPreset={(v) => setPrefs((p) => ({ ...p, preset: v }))}
            onFromChange={(v) => setPrefs((p) => ({ ...p, customFrom: v }))}
            onToChange={(v) => setPrefs((p) => ({ ...p, customTo: v }))}
            textColor={textColor}
            accentColor={accentColor}
            borderColor={borderColor}
          />
        </div>
      )}

      {/* ── Color Panel ── */}
      {showColorPanel && (
        <div
          style={{
            padding: '14px 16px',
            marginBottom: 14,
            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#FAFBFC',
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: `${textColor}60`,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 10px',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Series Colors
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ColorPickerRow
              label="Income"
              color={incomeColor}
              defaultColor={accentColor}
              onChange={(c) => setPrefs((p) => ({ ...p, incomeColor: c }))}
              onReset={() => setPrefs((p) => ({ ...p, incomeColor: accentColor }))}
              textColor={textColor}
              borderColor={borderColor}
            />
            <ColorPickerRow
              label="Expense"
              color={expenseColor}
              defaultColor={DEFAULT_EXPENSE_COLOR}
              onChange={(c) => setPrefs((p) => ({ ...p, expenseColor: c }))}
              onReset={() => setPrefs((p) => ({ ...p, expenseColor: DEFAULT_EXPENSE_COLOR }))}
              textColor={textColor}
              borderColor={borderColor}
            />
          </div>
        </div>
      )}

      {/* ── Chart Area ── */}
      <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
        {chartData.length === 0 ? (
          <div
            style={{
              height: '100%',
              minHeight: 200,
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
            <span style={{ fontSize: 28, opacity: 0.2 }}>📈</span>
            <p
              style={{ fontSize: 12, color: `${textColor}50`, fontFamily: "'Poppins', sans-serif" }}
            >
              No data for the selected range
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart() as React.ReactElement}
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${borderColor}`,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: `${textColor}50`,
            fontFamily: "'Poppins', sans-serif",
            margin: 0,
          }}
        >
          Net:{' '}
          <strong style={{ color: net >= 0 ? incomeColor : expenseColor }}>
            ₵ {Math.abs(net).toLocaleString('en-GH')}
            {net >= 0 ? ' surplus' : ' deficit'}
          </strong>
        </p>

        <button
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: accentColor,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          View details
        </button>
      </div>
    </div>
  );
}
