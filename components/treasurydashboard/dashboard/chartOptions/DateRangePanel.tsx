'use client';

import React, { useState, useRef } from 'react';

// ── Types & Helpers ──────────────────────────────────────────────────────────

export interface TreasuryDateRange {
  from: string;
  to: string;
}
export interface TreasuryPreset {
  value: string;
  label: string;
}

interface DateInputProps {
  label: string;
  isoValue: string;
  onChange: (value: string) => void;
  accentColor: string;
  textColor: string;
  borderColor: string;
}

interface DateRangeDropdownProps {
  mode: 'preset' | 'range'; // ← fixed: was `string`
  preset: string;
  customFrom: string;
  customTo: string;
  onMode: (mode: 'preset' | 'range') => void; // ← fixed: was `(mode: string) => void`
  onPreset: (preset: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

export const TREASURY_PRESETS: TreasuryPreset[] = [
  { value: 'today', label: 'Today' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'last_12_m', label: 'Last 12 Months' },
  { value: 'all', label: 'All Time' },
];

export function resolveTreasuryPreset(preset: string, now = new Date()): TreasuryDateRange {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  const iso = (yr: number, mo: number, dy: number) => `${yr}-${pad(mo)}-${pad(dy)}`;

  switch (preset) {
    case 'today': {
      return { from: iso(y, m + 1, d), to: iso(y, m + 1, d) };
    }
    case 'last_7_days': {
      const past = new Date(now);
      past.setDate(d - 7);
      return {
        from: iso(past.getFullYear(), past.getMonth() + 1, past.getDate()),
        to: iso(y, m + 1, d),
      };
    }
    case 'this_month': {
      return { from: iso(y, m + 1, 1), to: iso(y, m + 1, new Date(y, m + 1, 0).getDate()) };
    }
    case 'last_month': {
      const lm = m === 0 ? 12 : m;
      const ly = m === 0 ? y - 1 : y;
      return { from: iso(ly, lm, 1), to: iso(ly, lm, new Date(ly, lm, 0).getDate()) };
    }
    case 'ytd': {
      return { from: iso(y, 1, 1), to: iso(y, m + 1, d) };
    }
    default: {
      return { from: '', to: '' };
    }
  }
}

const isoToDisplay = (iso: string): string => (iso ? iso.split('-').reverse().join('/') : '');

const autoSlash = (next: string): string => {
  let v = next.replace(/[^\d]/g, '').slice(0, 8);
  if (v.length >= 5) {
    v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
  } else if (v.length >= 3) {
    v = v.slice(0, 2) + '/' + v.slice(2);
  }
  return v;
};

// ── Auto text colour from hex background ────────────────────────────────────

function autoText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

// ── Sub-component: DateInput ─────────────────────────────────────────────────
function DateInput({
  label,
  isoValue,
  onChange,
  accentColor,
  textColor,
  borderColor,
}: DateInputProps) {
  const [display, setDisplay] = useState<string>(isoToDisplay(isoValue));
  const [prevIsoValue, setPrevIsoValue] = useState<string>(isoValue);
  if (isoValue !== prevIsoValue) {
    setPrevIsoValue(isoValue);
    setDisplay(isoToDisplay(isoValue));
  }

  return (
    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
      <label
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: `${textColor}80`,
          textTransform: 'uppercase',
          marginBottom: 5,
          display: 'block',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </label>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          border: `1.5px solid ${borderColor}`,
          borderRadius: 10,
          padding: '6px 8px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <input
          type="text"
          value={display}
          placeholder="DD/MM/YY"
          onChange={(e) => setDisplay(autoSlash(e.target.value))}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            color: textColor,
            fontSize: 11,
            outline: 'none',
            width: '100%',
          }}
        />
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          style={{ flexShrink: 0, marginLeft: 4 }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <input
          type="date"
          value={isoValue}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}

// ── Main Dropdown Component ──────────────────────────────────────────────────

export default function DateRangeDropdown({
  mode,
  preset,
  customFrom,
  customTo,
  onMode,
  onPreset,
  onFromChange,
  onToChange,
  textColor,
  accentColor,
  borderColor,
}: DateRangeDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, []);

  const panelBg = '#1A3F6B';
  const panelText = autoText(panelBg);
  const secondaryBg = 'rgba(255,255,255,0.08)';
  const panelBorder = 'rgba(255,255,255,0.14)';
  const inputBorder = 'rgba(255,255,255,0.22)';

  const triggerLabel =
    mode === 'preset'
      ? (TREASURY_PRESETS.find((p) => p.value === preset)?.label ?? 'Select Date')
      : customFrom && customTo
        ? `${isoToDisplay(customFrom)} – ${isoToDisplay(customTo)}`
        : 'Custom Range';

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block', fontFamily: "'Poppins', sans-serif" }}
    >
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          borderRadius: 12,
          border: `1.5px solid ${isOpen ? accentColor : borderColor}`,
          backgroundColor: isOpen ? `${accentColor}10` : 'transparent',
          color: textColor,
          cursor: 'pointer',
          transition: '0.2s',
          outline: 'none',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{triggerLabel}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={`${textColor}40`}
          strokeWidth="3"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* ── Panel ── */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            left: 0,
            width: '320px',
            boxSizing: 'border-box',
            backgroundColor: panelBg,
            borderRadius: 20,
            padding: '18px',
            zIndex: 1000,
            border: `1px solid ${panelBorder}`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            animation: 'pop 0.2s ease-out',
            overflow: 'hidden',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              background: secondaryBg,
              padding: '4px',
              borderRadius: 12,
              marginBottom: 18,
            }}
          >
            {(['preset', 'range'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onMode(m)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: mode === m ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: mode === m ? '#FFFFFF' : `${panelText}55`,
                  transition: '0.2s',
                  textTransform: 'uppercase',
                }}
              >
                {m === 'preset' ? 'Presets' : 'Custom'}
              </button>
            ))}
          </div>

          {mode === 'preset' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TREASURY_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    onPreset(p.value);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: `1px solid ${preset === p.value ? accentColor : inputBorder}`,
                    backgroundColor: preset === p.value ? `${accentColor}20` : 'transparent',
                    color: preset === p.value ? accentColor : panelText,
                    transition: '0.1s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ boxSizing: 'border-box', width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <DateInput
                  label="Start"
                  isoValue={customFrom}
                  onChange={onFromChange}
                  accentColor={accentColor}
                  textColor={panelText}
                  borderColor={inputBorder}
                />
                <div style={{ marginTop: 32, color: `${panelText}30`, flexShrink: 0 }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M5 12h14" />
                  </svg>
                </div>
                <DateInput
                  label="End"
                  isoValue={customTo}
                  onChange={onToChange}
                  accentColor={accentColor}
                  textColor={panelText}
                  borderColor={inputBorder}
                />
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={!customFrom || !customTo}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: '13px',
                  borderRadius: 14,
                  border: 'none',
                  backgroundColor:
                    !customFrom || !customTo ? 'rgba(255,255,255,0.12)' : accentColor,
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: !customFrom || !customTo ? 'not-allowed' : 'pointer',
                  transition: '0.2s',
                  letterSpacing: '0.06em',
                  boxSizing: 'border-box',
                }}
              >
                APPLY RANGE
              </button>

              <button
                type="button"
                onClick={() => {
                  onFromChange('');
                  onToChange('');
                }}
                style={{
                  width: '100%',
                  marginTop: 10,
                  background: 'none',
                  border: 'none',
                  color: '#F87171',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                }}
              >
                RESET DATES
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes pop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
