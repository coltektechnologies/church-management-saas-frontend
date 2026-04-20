'use client';

/**
 * RecentTransactions.tsx
 */

import { useState, useEffect, useMemo } from 'react';
import { Clock, ArrowDown, ArrowUp } from 'lucide-react';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface IncomeRecord {
  id: string;
  date: string;         // "DD/MM/YYYY"
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

interface TransactionRow {
  id: string;
  type: 'income' | 'expense';
  title: string;
  subtitle: string;
  amount: string;
  isPositive: boolean;
  sortKey: number;
}

// ── Avatar colour palette ─────────────────────────────────────────────────────
/**
 * Updated palette with bright, vibrant "Google-style" colors
 * optimized for white icon overlays.
 */
const AVATAR_PALETTE = [
  '#0F9D58', // Vibrant Green
  '#4285F4', // Bright Blue
  '#DB4437', // Vibrant Red
  '#F4B400', // Bright Amber
  '#673AB7', // Deep Purple
  '#00ACC1', // Cyan
  '#FF7043', // Deep Orange
  '#EC407A', // Pink
  '#26A69A', // Teal
  '#5C6BC0', // Indigo
];

/** Deterministic colour per id so the colour stays stable across re-renders */
function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
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

function dmyToMs(s: string): number {
  const parts = s?.split('/');
  if (!parts || parts.length !== 3) { return 0; }
  const [d, m, y] = parts.map(Number);
  return new Date(y, m - 1, d).getTime() || 0;
}

function dmyToDisplay(s: string): string {
  const parts = s?.split('/');
  if (!parts || parts.length !== 3) { return s ?? ''; }
  const [d, m, y] = parts.map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function incomeTypeLabel(type: string, detail?: string): string {
  const MAP: Record<string, string> = {
    tithe: 'Tithe Collection',
    offering: 'General Offering',
    thanksgiving: 'Thanksgiving',
    harvest: 'Harvest Offering',
    welfare: 'Welfare Fund',
    other: 'Other Income',
  };
  const base = MAP[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
  return detail ? `${base} — ${detail}` : base;
}

function formatAmt(amount: number, currency: string): string {
  const symbols: Record<string, string> = { GHS: 'GHS', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] ?? currency;
  return `+${sym}${amount.toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;
}

// ── localStorage reader ───────────────────────────────────────────────────────
const INCOME_RECORDS_KEY = 'treasury_income_records_v1';

function loadIncomeRecords(): IncomeRecord[] {
  if (typeof window === 'undefined') { return []; }
  try {
    const raw = localStorage.getItem(INCOME_RECORDS_KEY);
    return raw ? (JSON.parse(raw) as IncomeRecord[]) : [];
  } catch {
    return [];
  }
}

// ── Dummy Expense Transactions ────────────────────────────────────────────────
const DUMMY_EXPENSES: TransactionRow[] = [
  {
    id: 'exp-1',
    type: 'expense',
    title: 'Electricity Bill',
    subtitle: 'Monthly utility payment • Aug 4, 2024',
    amount: '-GHS850',
    isPositive: false,
    sortKey: new Date(2024, 7, 4).getTime(),
  },
  {
    id: 'exp-2',
    type: 'expense',
    title: 'Pastor Allowance',
    subtitle: 'Monthly stipend • Aug 1, 2024',
    amount: '-GHS2,000',
    isPositive: false,
    sortKey: new Date(2024, 7, 1).getTime(),
  },
  {
    id: 'exp-3',
    type: 'expense',
    title: 'Church Supplies',
    subtitle: 'Monthly supplies • Jul 28, 2024',
    amount: '-GHS450',
    isPositive: false,
    sortKey: new Date(2024, 6, 28).getTime(),
  },
];

function toTransactionRows(records: IncomeRecord[]): TransactionRow[] {
  return records.map((r) => ({
    id: r.id,
    type: 'income' as const,
    title: incomeTypeLabel(r.incomeType, r.incomeTypeDetail),
    subtitle: `${r.memberName} • ${dmyToDisplay(r.date)}`,
    amount: formatAmt(r.amount, r.currency),
    isPositive: true,
    sortKey: dmyToMs(r.date),
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RecentTransactions() {
  const { profile, isReady } = useTreasuryProfile();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  //    data — no setState call needed inside the effect body ─────────────────
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(
    () => loadIncomeRecords(),
  );

  useEffect(() => {
    const id = setInterval(() => { setIncomeRecords(loadIncomeRecords()); }, 3000);
    return () => { clearInterval(id); };
  }, []);

  const isDark      = isReady ? profile.darkMode : false;
  const cardBg      = isDark ? profile.darkBackgroundColor || '#0A1628' : '#FFFFFF';
  const textColor   = autoText(cardBg);
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB';
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor     || '#2FC4B2';

  const incomeColor  = accentColor;
  const expenseColor = '#F76D6F';

  const allTransactions: TransactionRow[] = useMemo(() => {
    const incomeRows = toTransactionRows(incomeRecords);
    return [...incomeRows, ...DUMMY_EXPENSES].sort((a, b) => b.sortKey - a.sortKey);
  }, [incomeRecords]);

  const filtered = useMemo(() => {
    const list =
      filter === 'all'
        ? allTransactions
        : allTransactions.filter((t) => t.type === filter);
    return list.slice(0, 8);
  }, [allTransactions, filter]);

  const getPillStyle = (active: boolean, color: string): React.CSSProperties => ({
    padding: '4px 14px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${active ? color : borderColor}`,
    backgroundColor: active ? `${color}15` : 'transparent',
    color: active ? color : `${textColor}60`,
    transition: 'all 0.2s ease',
    fontFamily: "'Poppins', sans-serif",
  });

  return (
    <div style={{
      backgroundColor: cardBg,
      borderRadius: 16,
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      border: `1px solid ${borderColor}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={18} style={{ color: textColor }} />
          <h3 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: textColor,
            margin: 0,
          }}>
            Recent Transactions
          </h3>
        </div>
        <button style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: accentColor,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}>
          View All
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 16,
        paddingBottom: 14,
        borderBottom: `1.5px solid ${borderColor}`,
        flexWrap: 'wrap',
      }}>
  
        <button onClick={() => { setFilter('all'); }}     style={getPillStyle(filter === 'all',     accentColor)}>All</button>
        <button onClick={() => { setFilter('income'); }}  style={getPillStyle(filter === 'income',  incomeColor)}>Income</button>
        <button onClick={() => { setFilter('expense'); }} style={getPillStyle(filter === 'expense', expenseColor)}>Expenses</button>
      </div>

      {/* ── Transaction List ── */}
      {filtered.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          border: `1px dashed ${borderColor}`,
          borderRadius: 10,
          padding: 24,
        }}>
          <span style={{ fontSize: 28, opacity: 0.2 }}>💳</span>
          <p style={{
            fontSize: 12,
            color: `${textColor}50`,
            fontFamily: "'Poppins', sans-serif",
            textAlign: 'center',
            margin: 0,
          }}>
            {filter === 'income'
              ? 'No income records yet — add one via Record Income.'
              : filter === 'expense'
              ? 'No expense records yet.'
              : 'No transactions yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            // Each transaction gets its own deterministic bright palette colour
            const dotColor = avatarColor(tx.id);
            const amtColor = isIncome ? incomeColor : expenseColor;

            return (
              <div key={tx.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                paddingBottom: 14,
                borderBottom: `1px solid ${borderColor}`,
              }}>
                {/* Vibrant Avatar circle with auto-matched icon color */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: dotColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 3px 8px ${dotColor}40`,
                }}>
                  {isIncome
                    ? <ArrowDown size={17} color={autoText(dotColor)} strokeWidth={3} />
                    : <ArrowUp   size={17} color={autoText(dotColor)} strokeWidth={3} />
                  }
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: textColor,
                    margin: '0 0 2px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {tx.title}
                  </h4>
                  <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 11,
                    color: `${textColor}70`,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {tx.subtitle}
                  </p>
                </div>

                {/* Amount */}
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                  color: amtColor,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {tx.amount}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}