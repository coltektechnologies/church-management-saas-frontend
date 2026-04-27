'use client';

/**
 * Church vs Conference demarcation for recorded income (matches backend treasury.signals).
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Church,
  LandPlot,
  PieChart,
  Scale,
  Send,
  Sparkles,
} from 'lucide-react';

import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { getIncomeTransactions, type IncomeTransactionItem } from '@/lib/treasuryApi';

const layoutMax = '1200px';
const CURRENCY = 'GHS';

function numFromString(s: string | number | undefined): number {
  if (s === null || s === undefined) {
    return 0;
  }
  if (typeof s === 'number') {
    return Number.isFinite(s) ? s : 0;
  }
  const n = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number): string {
  return n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function startOfYear(d: Date): string {
  return `${d.getFullYear()}-01-01`;
}

function todayISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sumAllocations(tx: IncomeTransactionItem): { church: number; conference: number } {
  const rows = tx.allocations;
  if (!Array.isArray(rows) || rows.length === 0) {
    return { church: 0, conference: 0 };
  }
  let church = 0;
  let conference = 0;
  for (const a of rows) {
    const amt = numFromString(a.amount);
    const dest = String(a.destination || '').toUpperCase();
    if (dest === 'CHURCH') {
      church += amt;
    } else if (dest === 'CONFERENCE') {
      conference += amt;
    }
  }
  return { church, conference };
}

const POLICY_CARDS: {
  key: string;
  title: string;
  line: string;
  left: string;
  right: string;
  Icon: typeof Scale;
}[] = [
  {
    key: 'tithe',
    title: 'Tithe',
    line: 'Goes entirely to the conference in trust.',
    left: '0%',
    right: '100%',
    Icon: Church,
  },
  {
    key: 'loose',
    title: 'General & loose offering',
    line: 'Local church and conference share equally.',
    left: '50%',
    right: '50%',
    Icon: Scale,
  },
  {
    key: 'harvest',
    title: 'Harvest',
    line: 'Annual, Thanksgiving, and other harvest-dedicated lines.',
    left: '80%',
    right: '20%',
    Icon: LandPlot,
  },
  {
    key: 'other',
    title: 'All other income',
    line: 'Sabbath school, project, special, and similar categories.',
    left: '100%',
    right: '0%',
    Icon: Building2,
  },
];

export default function IncomeAllocationsPage() {
  const { profile } = useTreasuryProfile();
  const isDark = profile.darkMode ?? false;
  const cardBg = isDark ? profile.darkBackgroundColor || '#0A1628' : '#FFFFFF';
  const pageBg = isDark
    ? profile.darkBackgroundColor || '#0B1D35'
    : profile.backgroundColor || '#EEF2F7';
  const textColor = isDark ? '#F1F5F9' : '#0B2A4A';
  const muted = isDark ? 'rgba(255,255,255,0.6)' : '#64748B';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E0E5ED';
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const primaryColor = isDark
    ? profile.darkPrimaryColor || '#1A3F6B'
    : profile.primaryColor || '#0B2A4A';

  const [start, setStart] = useState(() => startOfYear(new Date()));
  const [end, setEnd] = useState(() => todayISODate(new Date()));

  const {
    data: rows = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['treasury', 'income-allocations', start, end],
    queryFn: () =>
      getIncomeTransactions({
        start_date: start,
        end_date: end,
        page_size: 500,
      }),
  });

  const totals = useMemo(() => {
    let church = 0;
    let conference = 0;
    let withSplits = 0;
    for (const tx of rows) {
      const s = sumAllocations(tx);
      if (s.church + s.conference > 0) {
        withSplits += 1;
      }
      church += s.church;
      conference += s.conference;
    }
    const grand = church + conference;
    return { church, conference, grand, count: rows.length, withSplits };
  }, [rows]);

  const pctChurch = totals.grand > 0 ? (totals.church / totals.grand) * 100 : 0;
  const pctConference = totals.grand > 0 ? (totals.conference / totals.grand) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: pageBg, color: textColor }}>
      <div
        style={{
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
        }}
      >
        <div
          style={{
            maxWidth: layoutMax,
            margin: '0 auto',
            padding: '14px clamp(16px, 4vw, 28px)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px 20px',
          }}
        >
          <Link
            href="/treasury/income"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: textColor,
              textDecoration: 'none',
              fontFamily: "'OV Soge', sans-serif",
            }}
          >
            <ArrowLeft size={16} style={{ color: accentColor }} />
            Income recording
          </Link>
          <span style={{ color: borderColor, fontSize: 12 }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${primaryColor}22 0%, ${accentColor}22 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${borderColor}`,
              }}
            >
              <PieChart size={18} style={{ color: accentColor }} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'OV Soge', sans-serif",
                  fontWeight: 800,
                  fontSize: 17,
                  margin: 0,
                  letterSpacing: -0.02,
                }}
              >
                Church &amp; conference allocation
              </h1>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: 12,
                  fontWeight: 500,
                  color: muted,
                  fontFamily: "'OV Soge', sans-serif",
                }}
              >
                Demarcation of remitted income ({CURRENCY}) based on your recorded categories
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: layoutMax,
          margin: '0 auto',
          padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 32px) 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Date range */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: 12,
            padding: '16px 18px',
            borderRadius: 14,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            boxShadow: isDark
              ? '0 1px 0 rgba(255,255,255,0.04)'
              : '0 2px 12px rgba(15, 40, 70, 0.04)',
            fontFamily: "'OV Soge', sans-serif",
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: muted,
              }}
            >
              From
            </label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${borderColor}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                color: textColor,
                fontSize: 14,
                fontWeight: 600,
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: muted,
              }}
            >
              To
            </label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${borderColor}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                color: textColor,
                fontSize: 14,
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        {isError && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 12,
              border: `1px solid ${borderColor}`,
              background: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
              color: isDark ? '#FECACA' : '#991B1B',
              fontSize: 13,
              fontFamily: "'OV Soge', sans-serif",
            }}
          >
            Could not load income for this range. Check your connection and try again.
          </div>
        )}

        {/* Hero totals */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 16,
              padding: '22px 22px 20px',
              background: `linear-gradient(160deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: "'OV Soge', sans-serif",
              boxShadow: `0 8px 28px ${primaryColor}44`,
            }}
          >
            <Sparkles
              size={100}
              style={{ position: 'absolute', right: -18, top: -18, opacity: 0.12 }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.12em',
                opacity: 0.85,
              }}
            >
              LOCAL CHURCH PORTION
            </p>
            <p
              style={{ margin: '10px 0 0 0', fontSize: 30, fontWeight: 800, letterSpacing: -0.02 }}
            >
              {CURRENCY} {isLoading ? '—' : formatMoney(totals.church)}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: 13, fontWeight: 500, opacity: 0.88 }}>
              {totals.grand > 0 ? `${pctChurch.toFixed(1)}%` : '—'} of recorded split total
            </p>
          </div>
          <div
            style={{
              borderRadius: 16,
              padding: '22px 22px 20px',
              background: `linear-gradient(160deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
              color: 'rgba(255,255,255,0.98)',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: "'OV Soge', sans-serif",
              boxShadow: `0 8px 28px ${accentColor}55`,
            }}
          >
            <Send size={100} style={{ position: 'absolute', right: -14, top: -12, opacity: 0.1 }} />
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.12em',
                opacity: 0.9,
              }}
            >
              CONFERENCE PORTION
            </p>
            <p
              style={{ margin: '10px 0 0 0', fontSize: 30, fontWeight: 800, letterSpacing: -0.02 }}
            >
              {CURRENCY} {isLoading ? '—' : formatMoney(totals.conference)}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: 13, fontWeight: 500, opacity: 0.9 }}>
              {totals.grand > 0 ? `${pctConference.toFixed(1)}%` : '—'} of recorded split total
            </p>
          </div>
        </div>

        {/* Stacked bar */}
        <div
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 16,
            padding: '20px 22px',
            fontFamily: "'OV Soge', sans-serif",
          }}
        >
          <p style={{ margin: '0 0 12px 0', fontSize: 13, fontWeight: 700, color: textColor }}>
            Remittance mix (period)
          </p>
          <div
            style={{
              display: 'flex',
              height: 14,
              borderRadius: 8,
              overflow: 'hidden',
              background: isDark ? 'rgba(255,255,255,0.06)' : '#EEF2F7',
            }}
          >
            {totals.grand <= 0 ? (
              <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }} />
            ) : (
              <>
                {pctChurch > 0 && (
                  <div
                    style={{
                      width: `${pctChurch}%`,
                      background: primaryColor,
                    }}
                    title={`Church ${pctChurch.toFixed(1)}%`}
                  />
                )}
                {pctConference > 0 && (
                  <div
                    style={{
                      width: `${pctConference}%`,
                      background: accentColor,
                    }}
                    title={`Conference ${pctConference.toFixed(1)}%`}
                  />
                )}
              </>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 10,
              fontSize: 12,
              fontWeight: 600,
              color: muted,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: primaryColor }} />
              Church
            </span>
            <span>
              {isLoading
                ? '…'
                : `${totals.count} receipt(s) in range${
                    totals.count > 0 && totals.withSplits < totals.count
                      ? ` · ${totals.withSplits} with split data`
                      : ''
                  }`}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: accentColor }} />
              Conference
            </span>
          </div>
        </div>

        {/* Policy reference */}
        <div>
          <h2
            style={{
              fontFamily: "'OV Soge', sans-serif",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: muted,
              margin: '0 0 12px 4px',
            }}
          >
            Policy demarcation (how splits are generated)
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
            }}
          >
            {POLICY_CARDS.map((c) => {
              const Icon = c.Icon;
              return (
                <div
                  key={c.key}
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 14,
                    padding: '18px 18px 16px',
                    position: 'relative',
                    fontFamily: "'OV Soge', sans-serif",
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: `${accentColor}18`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={16} style={{ color: accentColor }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: textColor }}>
                        {c.title}
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.45, color: muted }}>
                    {c.line}
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 10,
                        padding: '8px 10px',
                        background: `${primaryColor}10`,
                        border: `1px solid ${primaryColor}28`,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, color: muted, marginBottom: 2 }}>
                        CHURCH
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: primaryColor }}>
                        {c.left}
                      </div>
                    </div>
                    <div
                      style={{
                        borderRadius: 10,
                        padding: '8px 10px',
                        background: `${accentColor}12`,
                        border: `1px solid ${accentColor}32`,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, color: muted, marginBottom: 2 }}>
                        CONFERENCE
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: accentColor }}>
                        {c.right}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail table */}
        <div
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 16,
            overflow: 'hidden',
            fontFamily: "'OV Soge', sans-serif",
          }}
        >
          <div
            style={{
              padding: '16px 18px',
              borderBottom: `1px solid ${borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Receipts in range</p>
          </div>
          {isLoading ? (
            <p style={{ padding: 32, textAlign: 'center', color: muted }}>Loading…</p>
          ) : rows.length === 0 ? (
            <p style={{ padding: 32, textAlign: 'center', color: muted, margin: 0, fontSize: 13 }}>
              No income recorded in this date range. Record entries under Income recording — splits
              appear here automatically.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}
              >
                <thead>
                  <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9' }}>
                    {['Date', 'Receipt', 'Category', 'Total', 'Church', 'Conference'].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign:
                            h === 'Total' || h === 'Church' || h === 'Conference'
                              ? 'right'
                              : 'left',
                          padding: '12px 16px',
                          fontWeight: 700,
                          color: muted,
                          textTransform: 'uppercase',
                          fontSize: 10,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...rows]
                    .sort((a, b) =>
                      String(b.transaction_date).localeCompare(String(a.transaction_date))
                    )
                    .map((tx) => {
                      const { church, conference } = sumAllocations(tx);
                      const total = numFromString(tx.amount);
                      return (
                        <tr key={tx.id} style={{ borderTop: `1px solid ${borderColor}` }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                            {tx.transaction_date}
                          </td>
                          <td style={{ padding: '12px 16px' }}>{tx.receipt_number ?? '—'}</td>
                          <td style={{ padding: '12px 16px' }}>{tx.category_name ?? '—'}</td>
                          <td
                            style={{
                              padding: '12px 16px',
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {formatMoney(total)}
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 600,
                              color: primaryColor,
                            }}
                          >
                            {church + conference > 0 ? formatMoney(church) : '—'}
                          </td>
                          <td
                            style={{
                              padding: '12px 16px',
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 600,
                              color: accentColor,
                            }}
                          >
                            {church + conference > 0 ? formatMoney(conference) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
