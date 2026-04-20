'use client';

/**
 * Monthly income vs expenses from API (`MonthlyTrend[]`), styled for the treasury portal shell.
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import type { MonthlyTrend } from '@/services/treasuryService';

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

function fmtAxis(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(0)}k`;
  }
  return String(Math.round(n));
}

export default function TreasuryMonthlyTrendApi({
  data,
  isLoading,
}: {
  data: MonthlyTrend[];
  isLoading?: boolean;
}) {
  const { profile, isReady } = useTreasuryProfile();

  const isDark = isReady ? profile.darkMode : false;
  const cardBg = isDark ? profile.darkBackgroundColor || '#0A1628' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const textColor = autoText(cardBg);
  const incomeColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const expenseColor = '#F76D6F';

  const chartRows = data.map((d) => ({
    month: d.month,
    income: d.income,
    expenses: d.expenses,
  }));

  const axisStyle = {
    fontSize: 10,
    fill: `${textColor}60`,
    fontFamily: "'OV Soge', sans-serif",
  };

  return (
    <div
      style={{
        backgroundColor: cardBg,
        borderRadius: 16,
        padding: '24px',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        height: '100%',
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: "'OV Soge', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: textColor,
            margin: 0,
          }}
        >
          Income vs expenses by month
        </h3>
        <p style={{ fontSize: 12, color: `${textColor}70`, margin: '6px 0 0 0' }}>
          From your church finance API (trend period)
        </p>
      </div>

      {isLoading ? (
        <div
          style={{
            flex: 1,
            borderRadius: 12,
            minHeight: 260,
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      ) : chartRows.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${textColor}55`,
            fontSize: 13,
            fontFamily: "'OV Soge', sans-serif",
          }}
        >
          No trend data for this period yet.
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid stroke={`${textColor}12`} strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmtAxis}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(value) =>
                  `₵ ${Number(value ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 0 })}`
                }
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(v) => (
                  <span style={{ color: textColor, textTransform: 'capitalize' }}>{v}</span>
                )}
              />
              <Bar dataKey="income" name="Income" fill={incomeColor} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill={expenseColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
