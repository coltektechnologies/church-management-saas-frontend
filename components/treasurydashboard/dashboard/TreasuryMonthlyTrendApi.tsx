'use client';

/**
 * Tithe vs offering trends: calendar Jan–Dec by year, or yearly totals across a year range.
 * Data: GET /api/analytics/finance/tithe-offerings/?calendar_year=… | year_from=&year_to=
 */

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { getTitheOfferingStats } from '@/lib/api';

type ViewMode = 'monthly' | 'yearly';
type ChartDisplay = 'bar' | 'line';

type ChartRow = { month: string; tithe: number; offering: number };

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

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

function yearOptions(): number[] {
  const y = new Date().getFullYear();
  const out: number[] = [];
  for (let i = 0; i <= 20; i += 1) {
    out.push(y - i);
  }
  return out;
}

function selectStyle(
  textColor: string,
  borderColor: string,
  cardBg: string,
  isDark: boolean
): CSSProperties {
  return {
    padding: '8px 10px',
    borderRadius: 8,
    border: `1px solid ${borderColor}`,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : cardBg,
    color: textColor,
    fontSize: 12,
    minWidth: 0,
    cursor: 'pointer',
  };
}

function modeBtnStyle(
  active: boolean,
  accentColor: string,
  textColor: string,
  borderColor: string,
  isDark: boolean
): CSSProperties {
  return {
    padding: '8px 14px',
    borderRadius: 8,
    border: `1px solid ${active ? accentColor : borderColor}`,
    backgroundColor: active ? accentColor : isDark ? 'rgba(255,255,255,0.06)' : 'transparent',
    color: active ? '#FFFFFF' : textColor,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  };
}

export default function TreasuryMonthlyTrendApi() {
  const { profile, isReady } = useTreasuryProfile();
  const years = useMemo(() => yearOptions(), []);
  const defaultYear = years[0] ?? new Date().getFullYear();

  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [calendarYear, setCalendarYear] = useState(defaultYear);
  const [endMonth, setEndMonth] = useState(12);
  const [yearlyFrom, setYearlyFrom] = useState(() => defaultYear - 5);
  const [yearlyTo, setYearlyTo] = useState(defaultYear);
  const [chartDisplay, setChartDisplay] = useState<ChartDisplay>('bar');

  const queryKey = [
    'treasury',
    'tithe-offering-trend',
    viewMode,
    calendarYear,
    endMonth,
    yearlyFrom,
    yearlyTo,
  ] as const;

  const { data: apiData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      if (viewMode === 'yearly') {
        const lo = Math.min(yearlyFrom, yearlyTo);
        const hi = Math.max(yearlyFrom, yearlyTo);
        return getTitheOfferingStats({ yearlyFrom: lo, yearlyTo: hi });
      }
      return getTitheOfferingStats({ calendarYear });
    },
  });

  const chartRows: ChartRow[] = useMemo(() => {
    if (!apiData) {
      return [];
    }
    if (viewMode === 'yearly') {
      return (apiData.yearly_trend ?? []).map((r) => ({
        month: r.year,
        tithe: r.tithe,
        offering: r.offering,
      }));
    }
    const full = apiData.monthly_trend ?? [];
    const end = Math.min(12, Math.max(1, endMonth));
    return full.slice(0, end);
  }, [apiData, viewMode, endMonth]);

  const isDark = isReady ? profile.darkMode : false;
  const cardBg = isDark ? profile.darkBackgroundColor || '#0A1628' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const textColor = autoText(cardBg);
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const titheColor = accentColor;
  const offeringColor = isDark
    ? profile.darkPrimaryColor || '#5B8DEF'
    : profile.primaryColor || '#1A3F6B';

  function rowSelectStyle(extra?: CSSProperties): CSSProperties {
    return {
      ...selectStyle(textColor, borderColor, cardBg, isDark),
      ...extra,
    };
  }

  const axisStyle = {
    fontSize: 10,
    fill: `${textColor}60`,
  };

  const title =
    viewMode === 'monthly'
      ? `Monthly tithe and offering (${calendarYear})`
      : 'Yearly tithe and offering';
  const subtitle =
    viewMode === 'monthly'
      ? endMonth === 12
        ? 'January through December for the selected year (church finance API).'
        : `January through ${MONTH_LABELS[endMonth - 1]} for ${calendarYear}.`
      : `Totals per calendar year from ${Math.min(yearlyFrom, yearlyTo)} to ${Math.max(yearlyFrom, yearlyTo)}.`;

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
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            style={modeBtnStyle(
              viewMode === 'monthly',
              accentColor,
              textColor,
              borderColor,
              isDark
            )}
            onClick={() => setViewMode('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            style={modeBtnStyle(viewMode === 'yearly', accentColor, textColor, borderColor, isDark)}
            onClick={() => setViewMode('yearly')}
          >
            Yearly
          </button>
        </div>

        {viewMode === 'monthly' ? (
          <>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: `${textColor}80`,
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>Year</span>
              <select
                value={calendarYear}
                onChange={(e) => setCalendarYear(Number(e.target.value))}
                style={rowSelectStyle()}
                aria-label="Calendar year"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: `${textColor}80`,
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>Through month</span>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(Number(e.target.value))}
                style={rowSelectStyle({ minWidth: '140px' })}
                aria-label="Show months through"
              >
                {MONTH_LABELS.map((label, i) => (
                  <option key={label} value={i + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: `${textColor}80`,
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>From year</span>
              <select
                value={yearlyFrom}
                onChange={(e) => setYearlyFrom(Number(e.target.value))}
                style={rowSelectStyle()}
                aria-label="Year from"
              >
                {years.map((y) => (
                  <option key={`f-${y}`} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: `${textColor}80`,
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>To year</span>
              <select
                value={yearlyTo}
                onChange={(e) => setYearlyTo(Number(e.target.value))}
                style={rowSelectStyle()}
                aria-label="Year to"
              >
                {years.map((y) => (
                  <option key={`t-${y}`} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: `${textColor}80`,
            }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>Chart</span>
            <select
              value={chartDisplay}
              onChange={(e) => setChartDisplay(e.target.value as ChartDisplay)}
              style={rowSelectStyle({ minWidth: '118px' })}
              aria-label="Chart type"
            >
              <option value="bar">Bar chart</option>
              <option value="line">Line chart</option>
            </select>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontWeight: 700,
            fontSize: 18,
            color: textColor,
            margin: 0,
          }}
        >
          {chartDisplay === 'line'
            ? viewMode === 'monthly'
              ? `Monthly trend of tithes vs offerings (${calendarYear})`
              : 'Yearly trend of tithes vs offerings'
            : title}
        </h3>
        <p style={{ fontSize: 12, color: `${textColor}70`, margin: '6px 0 0 0' }}>{subtitle}</p>
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
          }}
        >
          No tithe and offering data for this selection yet.
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartDisplay === 'bar' ? (
              <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke={`${textColor}12`} strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtAxis}
                  width={48}
                  domain={[0, 'auto']}
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
                <Bar dataKey="tithe" name="Tithe" fill={titheColor} radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="offering"
                  name="Offering"
                  fill={offeringColor}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid stroke={`${textColor}12`} strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtAxis}
                  width={48}
                  domain={[0, 'auto']}
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
                <Line
                  type="monotone"
                  dataKey="tithe"
                  name="Tithe"
                  stroke={titheColor}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: titheColor, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="offering"
                  name="Offering"
                  stroke={offeringColor}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: offeringColor, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
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
