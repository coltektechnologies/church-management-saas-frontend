'use client';

/**
 * CurrencyConverterModal.tsx
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import type { IncomeRecord } from './IncomeReceipt';
import { getOptions } from './dropdownOptions';
import { getCurrencySymbol } from './recordIncomeData';

interface CurrencyConverterModalProps {
  records: IncomeRecord[];
  onClose: () => void;
  textColor?: string;
  cardBg?: string;
  accentColor?: string;
  borderColor?: string;
  isDark?: boolean;
  /** Remaining theme props accepted but not used */
  [key: string]: unknown;
}

export default function CurrencyConverterModal({
  records,
  onClose,
  textColor   = '#0B2A4A',
  cardBg      = '#FFFFFF',
  accentColor = '#2FC4B2',
  borderColor = '#E0E5ED',
  isDark      = false,
}: CurrencyConverterModalProps) {
  const currencies = getOptions('currencies').map((o) => o.value);

  const [targetCurrency, setTargetCurrency] = useState(currencies[0] ?? 'GHS');

  // User-editable exchange rates (USD = 1 base)
  const initialRates: Record<string, string> = {};
  currencies.forEach((c) => {
    const defaults: Record<string, string> = { GHS: '15.5', USD: '1', EUR: '0.92', GBP: '0.79' };
    initialRates[c] = defaults[c] ?? '1';
  });
  const [rates, setRates] = useState<Record<string, string>>(initialRates);

  function convert(amount: number, from: string, to: string): number {
    if (from === to) {return amount;}
    const fromRate = parseFloat(rates[from] ?? '1') || 1;
    const toRate   = parseFloat(rates[to]   ?? '1') || 1;
    return (amount / fromRate) * toRate;
  }

  const byCurrency: Record<string, number> = {};
  records.forEach((r) => {
    byCurrency[r.currency] = (byCurrency[r.currency] ?? 0) + r.amount;
  });

  const convertedTotal = Object.entries(byCurrency).reduce(
    (sum, [cur, total]) => sum + convert(total, cur, targetCurrency),
    0,
  );
  const targetSymbol = getCurrencySymbol(targetCurrency);

  const inputStyle: React.CSSProperties = {
    fontFamily: "'OV Soge', sans-serif", fontSize: '12px', fontWeight: 500,
    color: textColor,
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${borderColor}`, borderRadius: '7px',
    outline: 'none', padding: '6px 10px', width: '80px', caretColor: accentColor,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      backgroundColor: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        borderRadius: '16px', padding: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        backgroundColor: cardBg, border: `1px solid ${borderColor}`,
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '15px', color: textColor, margin: 0 }}>
            Currency Converter
          </h3>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: `${textColor}60` }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '11px', color: `${textColor}60`, fontFamily: "'OV Soge',sans-serif", marginBottom: '14px', lineHeight: 1.5 }}>
          Edit exchange rates below (USD = 1 base).
        </p>

        {/* Rate editor */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: `${textColor}60`, fontFamily: "'OV Soge',sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Exchange Rates (1 USD = ?)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currencies.map((cur) => (
              <div key={cur} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: textColor, fontFamily: "'OV Soge',sans-serif", width: '40px' }}>{cur}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rates[cur] ?? '1'}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, '');
                    setRates((prev) => ({ ...prev, [cur]: v }));
                  }}
                  style={inputStyle}
                />
                <span style={{ fontSize: '11px', color: `${textColor}50`, fontFamily: "'OV Soge',sans-serif" }}>per USD</span>
              </div>
            ))}
          </div>
        </div>

        {/* Per-currency totals */}
        <div style={{ marginBottom: '12px' }}>
          {Object.entries(byCurrency).map(([cur, total]) => (
            <div key={cur} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${borderColor}` }}>
              <span style={{ fontSize: '12px', color: `${textColor}70`, fontFamily: "'OV Soge',sans-serif" }}>{cur} total</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: textColor, fontFamily: "'Poppins',sans-serif" }}>
                {getCurrencySymbol(cur)} {total.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>

        {/* Target currency selector */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: `${textColor}60`, fontFamily: "'OV Soge',sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Convert all to
          </div>
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            style={{ fontFamily: "'OV Soge', sans-serif", fontSize: '12px', fontWeight: 500, color: textColor, backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)', border: `1px solid ${borderColor}`, borderRadius: '8px', outline: 'none', padding: '8px 12px', width: '100%' }}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>{getCurrencySymbol(c)} {c}</option>
            ))}
          </select>
        </div>

        {/* Combined total */}
        <div style={{ borderRadius: '10px', padding: '14px', textAlign: 'center', backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: accentColor, fontFamily: "'OV Soge',sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Combined Total ({targetCurrency})
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: textColor, fontFamily: "'Poppins',sans-serif" }}>
            {targetSymbol} {convertedTotal.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '9px', color: `${textColor}50`, fontFamily: "'OV Soge',sans-serif", marginTop: '4px' }}>
            Based on the rates you entered above
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ width: '100%', height: '40px', borderRadius: '8px', marginTop: '14px', backgroundColor: accentColor, color: '#fff', fontFamily: "'OV Soge',sans-serif", fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}