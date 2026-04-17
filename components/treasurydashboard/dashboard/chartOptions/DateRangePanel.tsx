'use client';

/**
 * Treasury DateRangePanel
 */

import React, { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TreasuryDateRange {
  from: string; // ISO "YYYY-MM-DD" or ""
  to:   string; // ISO "YYYY-MM-DD" or ""
}

export interface TreasuryPreset {
  value: string;
  label: string;
}

export const TREASURY_PRESETS: TreasuryPreset[] = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'q1',         label: 'Q1 Jan–Mar' },
  { value: 'q2',         label: 'Q2 Apr–Jun' },
  { value: 'q3',         label: 'Q3 Jul–Sep' },
  { value: 'q4',         label: 'Q4 Oct–Dec' },
  { value: 'h1',         label: 'H1 Jan–Jun' },
  { value: 'h2',         label: 'H2 Jul–Dec' },
  { value: 'ytd',        label: 'Year to Date' },
  { value: 'all',        label: 'All Time' },
];

/** Returns ISO date bounds for each preset relative to `now`. */
export function resolveTreasuryPreset(preset: string, now = new Date()): TreasuryDateRange {
  const y = now.getFullYear();
  const pad = (n: number) => String(n).padStart(2, '0');
  const iso = (y: number, m: number, d: number) =>
    `${y}-${pad(m)}-${pad(d)}`;

  switch (preset) {
    case 'this_month': {
      const first = iso(y, now.getMonth() + 1, 1);
      const last  = iso(y, now.getMonth() + 1, new Date(y, now.getMonth() + 1, 0).getDate());
      return { from: first, to: last };
    }
    case 'last_month': {
      const lm   = now.getMonth() === 0 ? 12 : now.getMonth();
      const ly   = now.getMonth() === 0 ? y - 1 : y;
      const last = new Date(ly, lm, 0).getDate();
      return { from: iso(ly, lm, 1), to: iso(ly, lm, last) };
    }
    case 'q1':  return { from: iso(y, 1,  1),  to: iso(y, 3,  31) };
    case 'q2':  return { from: iso(y, 4,  1),  to: iso(y, 6,  30) };
    case 'q3':  return { from: iso(y, 7,  1),  to: iso(y, 9,  30) };
    case 'q4':  return { from: iso(y, 10, 1),  to: iso(y, 12, 31) };
    case 'h1':  return { from: iso(y, 1,  1),  to: iso(y, 6,  30) };
    case 'h2':  return { from: iso(y, 7,  1),  to: iso(y, 12, 31) };
    case 'ytd': return { from: iso(y, 1,  1),  to: iso(y, now.getMonth() + 1, now.getDate()) };
    default:    return { from: '', to: '' }; // "all"
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format ISO "YYYY-MM-DD" → display "MM/DD/YYYY" */
function isoToDisplay(iso: string): string {
  if (!iso) {return '';}
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

/** Parse display "MM/DD/YYYY" → ISO "YYYY-MM-DD" or "" */
function displayToIso(display: string): string {
  const clean = display.replace(/[^\d/]/g, '');
  const parts = clean.split('/');
  if (parts.length !== 3) {return '';}
  const [m, d, y] = parts;
  if (m.length !== 2 || d.length !== 2 || y.length !== 4) {return '';}
  const dt = new Date(`${y}-${m}-${d}`);
  if (isNaN(dt.getTime())) {return '';}
  return `${y}-${m}-${d}`;
}

/** Auto-insert slashes while typing MM/DD/YYYY */
function autoSlash(prev: string, next: string): string {
  // Only format on forward typing (length increased)
  let v = next.replace(/[^\d]/g, '');
  if (v.length > 8) {v = v.slice(0, 8);}
  if (v.length >= 5) {v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);}
  else if (v.length >= 3) {v = v.slice(0, 2) + '/' + v.slice(2);}
  return v;
}

// ── Sub-component: DateInput ─────────────────────────────────────────────────

interface DateInputProps {
  label:       string;
  isoValue:    string;
  onChange:    (iso: string) => void;
  accentColor: string;
  textColor:   string;
  borderColor: string;
  min?:        string;
  max?:        string;
}

function DateInput({
  label, isoValue, onChange, accentColor, textColor, borderColor, min, max,
}: DateInputProps) {
  const [display, setDisplay] = useState(isoToDisplay(isoValue));
  const [focused,  setFocused]  = useState(false);
  const [hasError, setHasError] = useState(false);

  // Keep display in sync when isoValue changes externally (preset clicks)
  React.useEffect(() => {
    setDisplay(isoToDisplay(isoValue));
    setHasError(false);
  }, [isoValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw  = e.target.value;
    const next = autoSlash(display, raw);
    setDisplay(next);

    if (next.length === 10) {
      const iso = displayToIso(next);
      if (iso) {
        setHasError(false);
        onChange(iso);
      } else {
        setHasError(true);
      }
    } else if (next === '') {
      setHasError(false);
      onChange('');
    }
  };

  // Native calendar picker (hidden <input type="date">) syncs with text field
  const handleNative = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value; // already "YYYY-MM-DD"
    setDisplay(isoToDisplay(iso));
    setHasError(false);
    onChange(iso);
  };

  const borderCol = hasError
    ? '#F87171'
    : focused
    ? accentColor
    : borderColor;

  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 9, fontWeight: 700,
        color: `${textColor}55`,
        fontFamily: "'OV Soge', sans-serif",
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: 5,
      }}>
        {label}
      </div>

      {/* Wrapper so the calendar icon sits inside the border */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: `1.5px solid ${borderCol}`,
        borderRadius: 8,
        overflow: 'hidden',
        transition: 'border-color 0.15s',
        backgroundColor: focused ? `${accentColor}08` : 'transparent',
      }}>
        {/* Text field — MM/DD/YYYY */}
        <input
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          value={display}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={10}
          style={{
            flex: 1,
            padding: '7px 10px',
            fontSize: 11,
            fontFamily: "'OV Soge', sans-serif",
            color: textColor,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            minWidth: 0,
          }}
        />

        {/* Calendar icon — opens native date picker */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          paddingRight: 8,
          cursor: 'pointer',
          color: focused ? accentColor : `${textColor}40`,
          transition: 'color 0.15s',
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* Calendar SVG */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8"  y1="2" x2="8"  y2="6"/>
            <line x1="3"  y1="10" x2="21" y2="10"/>
          </svg>
          {/* Invisible native date input overlaid on the icon */}
          <input
            type="date"
            value={isoValue}
            min={min}
            max={max}
            onChange={handleNative}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 1,
              height: 1,
              overflow: 'hidden',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          />
        </label>
      </div>

      {hasError && (
        <div style={{ fontSize: 9, color: '#F87171', marginTop: 3, fontFamily: "'OV Soge', sans-serif" }}>
          Invalid date
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface DateRangePanelProps {
  /** 'range' = explicit from/to inputs, 'preset' = pill shortcuts */
  mode:        'range' | 'preset';
  preset:      string;
  customFrom:  string; // ISO or ""
  customTo:    string; // ISO or ""
  onMode:      (m: 'range' | 'preset') => void;
  onPreset:    (p: string) => void;
  onFromChange:(iso: string) => void;
  onToChange:  (iso: string) => void;
  textColor:   string;
  accentColor: string;
  borderColor: string;
}

export default function DateRangePanel({
  mode, preset, customFrom, customTo,
  onMode, onPreset, onFromChange, onToChange,
  textColor, accentColor, borderColor,
}: DateRangePanelProps) {

  const sectionLabel: React.CSSProperties = {
    fontSize: 9, fontWeight: 800,
    color: `${textColor}50`,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: "'OV Soge', sans-serif",
  };

  const modeBtn = (active: boolean): React.CSSProperties => ({
    padding: '3px 11px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 9,
    fontFamily: "'OV Soge', sans-serif",
    fontWeight: active ? 700 : 500,
    textTransform: 'uppercase',
    border:           `1px solid ${active ? accentColor : borderColor}`,
    backgroundColor:  active ? `${accentColor}18` : 'transparent',
    color:            active ? accentColor : `${textColor}55`,
    transition: 'all 0.12s',
  });

  const presetBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 10,
    fontFamily: "'OV Soge', sans-serif",
    fontWeight: active ? 700 : 500,
    border:           `1px solid ${active ? accentColor : borderColor}`,
    backgroundColor:  active ? `${accentColor}18` : 'transparent',
    color:            active ? accentColor : `${textColor}60`,
    transition: 'all 0.12s',
  });

  return (
    <div>
      {/* ── Mode toggle ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={sectionLabel}>Filter by Date</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" onClick={() => onMode('preset')} style={modeBtn(mode === 'preset')}>
            Preset
          </button>
          <button type="button" onClick={() => onMode('range')} style={modeBtn(mode === 'range')}>
            Date Range
          </button>
        </div>
      </div>

      {mode === 'preset' ? (
        /* ── Preset pills ── */
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {TREASURY_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPreset(p.value)}
              style={presetBtn(preset === p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : (
        /* ── Date range inputs ── */
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <DateInput
              label="From"
              isoValue={customFrom}
              onChange={onFromChange}
              max={customTo || undefined}
              accentColor={accentColor}
              textColor={textColor}
              borderColor={borderColor}
            />

            {/* separator */}
            <div style={{
              alignSelf: 'center',
              marginTop: 18,
              fontSize: 12,
              color: `${textColor}30`,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              →
            </div>

            <DateInput
              label="To"
              isoValue={customTo}
              onChange={onToChange}
              min={customFrom || undefined}
              accentColor={accentColor}
              textColor={textColor}
              borderColor={borderColor}
            />
          </div>

          {/* Active range summary */}
          {customFrom && customTo && (
            <div style={{
              marginTop: 10,
              padding: '6px 12px',
              borderRadius: 8,
              backgroundColor: `${accentColor}10`,
              border: `1px solid ${accentColor}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{
                fontSize: 10,
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 600,
                color: accentColor,
              }}>
                {isoToDisplay(customFrom)} → {isoToDisplay(customTo)}
              </span>
              <button
                type="button"
                onClick={() => { onFromChange(''); onToChange(''); }}
                style={{
                  fontSize: 9,
                  color: `${textColor}40`,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'OV Soge', sans-serif",
                  padding: '0 2px',
                }}
              >
                ✕ Clear
              </button>
            </div>
          )}

          {/* Helper hint */}
          <p style={{
            fontSize: 9,
            color: `${textColor}35`,
            marginTop: 8,
            fontFamily: "'OV Soge', sans-serif",
          }}>
            Type MM/DD/YYYY or click the 📅 icon to open calendar
          </p>
        </div>
      )}
    </div>
  );
}