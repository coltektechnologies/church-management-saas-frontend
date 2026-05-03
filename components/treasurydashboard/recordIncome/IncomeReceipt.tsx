'use client';

import { useRef } from 'react';
import { Printer, Download, X, CheckCircle } from 'lucide-react';

// ── Shared types ─────────────────────────────────────────────────────────────
export interface IncomeRecord {
  id: string;
  date: string;
  incomeType: string;
  incomeTypeDetail?: string;
  memberId: string;
  memberName: string;
  /** When set, treasury POST links this payment to the member's pledge. */
  pledgeId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDetail?: string;
  receiptNumber: string;
  notification: string[];
  recordedAt: string;
  recordedBy: string;
}

export const CURRENCIES = [
  { code: 'GHS', symbol: '₵', name: 'Ghana Cedis' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export function formatCurrency(amount: number, currency: string): string {
  const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency;
  return `${sym} ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateReceiptNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const ms = now.getTime().toString().slice(-6);
  const rand = Math.floor(Math.random() * 90 + 10);
  return `RCP-${year}-${ms}${rand}`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function incomeTypeLabel(type: string, detail?: string): string {
  const map: Record<string, string> = {
    tithe: 'Tithe',
    offering: 'Offering',
    thanksgiving: 'Thanksgiving',
    harvest: 'Harvest & Pledge',
    welfare: 'Welfare',
    other: 'Other',
  };
  const base = map[type] ?? type;
  return detail ? `${base} — ${detail}` : base;
}

function paymentLabel(method: string, detail?: string): string {
  const map: Record<string, string> = {
    cash: 'Cash',
    momo: 'Mobile Money',
    bank_transfer: 'Bank Transfer',
  };
  const base = map[method] ?? method;
  return detail ? `${base} (${detail})` : base;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface IncomeReceiptProps {
  record: IncomeRecord;
  churchName?: string;
  churchAddress?: string;
  onClose: () => void;
  isDark?: boolean;
  cardBg?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  primaryColor?: string;
}

export default function IncomeReceipt({
  record,
  churchName = 'SDA Church - Adenta',
  churchAddress = 'Adenta, Accra, Ghana',
  onClose,
  isDark = false,
  cardBg = '#FFFFFF',
  textColor = '#0B2A4A',
  accentColor = '#2FC4B2',
  borderColor = '#DFDADA',
  primaryColor = '#0B2A4A',
}: IncomeReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const modalBg = cardBg;
  const subtleText = isDark ? 'rgba(255,255,255,0.45)' : '#888888';
  const rowBorder = isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f5';
  const amountBg = isDark ? `${accentColor}18` : '#f0fdfb';
  const headerBorder = isDark ? 'rgba(255,255,255,0.12)' : '#DFDADA';

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) {
      return;
    }
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) {
      return;
    }
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Receipt ${record.receiptNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Poppins',sans-serif;background:#fff;color:#0B2A4A}
        .receipt{max-width:480px;margin:40px auto;padding:40px;border:1px solid #DFDADA;border-radius:10px}
        .header{text-align:center;margin-bottom:24px;border-bottom:2px dashed #DFDADA;padding-bottom:20px}
        .church-name{font-size:18px;font-weight:700;color:#0B2A4A}
        .church-address{font-size:11px;color:#666;margin-top:2px}
        .receipt-title{font-size:13px;font-weight:600;color:#2FC4B2;margin-top:12px;letter-spacing:.08em;text-transform:uppercase}
        .receipt-number{font-size:22px;font-weight:700;color:#0B2A4A;margin-top:4px}
        .row{display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f0f0f0}
        .row:last-child{border-bottom:none}
        .label{font-size:11px;color:#888;font-weight:500}
        .value{font-size:12px;color:#0B2A4A;font-weight:600;text-align:right;max-width:60%}
        .amount-row{background:#f0fdfb;border-radius:8px;padding:14px 16px;margin:16px 0;display:flex;justify-content:space-between;align-items:center}
        .amount-label{font-size:12px;font-weight:600;color:#2FC4B2}
        .amount-value{font-size:24px;font-weight:700;color:#0B2A4A}
        .footer{text-align:center;margin-top:24px;padding-top:16px;border-top:2px dashed #DFDADA}
        .footer p{font-size:10px;color:#aaa;margin-top:4px}
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 16px 40px',
      }}
    >
      <div
        style={{
          backgroundColor: modalBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          width: '100%',
          maxWidth: '520px',
          // No max-height / overflow here — the outer wrapper scrolls instead
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: `1px solid ${headerBorder}`,
            position: 'sticky',
            top: 0,
            backgroundColor: modalBg,
            borderRadius: '16px 16px 0 0',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} style={{ color: accentColor }} />
            <span
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 600,
                fontSize: '15px',
                color: textColor,
              }}
            >
              Income Recorded Successfully
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: `${textColor}10`,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} style={{ color: textColor }} />
          </button>
        </div>

        {/* Printable content */}
        <div ref={printRef} style={{ padding: '24px' }}>
          <div style={{ maxWidth: '440px', margin: '0 auto', fontFamily: "'Poppins',sans-serif" }}>
            {/* Church header */}
            <div
              style={{
                textAlign: 'center',
                paddingBottom: '20px',
                marginBottom: '20px',
                borderBottom: `2px dashed ${headerBorder}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '18px', color: textColor }}>
                {churchName}
              </div>
              <div style={{ fontSize: '11px', color: subtleText, marginTop: '2px' }}>
                {churchAddress}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: accentColor,
                  marginTop: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Official Income Receipt
              </div>
              <div
                style={{ fontSize: '22px', fontWeight: 700, color: textColor, marginTop: '4px' }}
              >
                {record.receiptNumber}
              </div>
            </div>

            {/* Amount */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                background: amountBg,
                border: `1px solid ${accentColor}30`,
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: accentColor }}>
                AMOUNT RECEIVED
              </span>
              <span style={{ fontSize: '26px', fontWeight: 700, color: textColor }}>
                {formatCurrency(record.amount, record.currency)}
              </span>
            </div>

            {/* Details */}
            {(
              [
                { label: 'Date', value: record.date },
                {
                  label: 'Income Type',
                  value: incomeTypeLabel(record.incomeType, record.incomeTypeDetail),
                },
                { label: 'Member', value: record.memberName },
                {
                  label: 'Payment Method',
                  value: paymentLabel(record.paymentMethod, record.paymentDetail),
                },
                { label: 'Notification', value: record.notification.join(', ') || '—' },
                { label: 'Recorded At', value: record.recordedAt },
                { label: 'Recorded By', value: record.recordedBy },
              ] as { label: string; value: string }[]
            ).map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '10px 0',
                  borderBottom: `1px solid ${rowBorder}`,
                  gap: '12px',
                }}
              >
                <span
                  style={{ fontSize: '11px', color: subtleText, fontWeight: 500, flexShrink: 0 }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: textColor,
                    fontWeight: 600,
                    textAlign: 'right',
                    maxWidth: '60%',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}

            {/* Footer */}
            <div
              style={{
                textAlign: 'center',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: `2px dashed ${headerBorder}`,
              }}
            >
              <p style={{ fontSize: '10px', color: subtleText }}>
                Thank you for your generous contribution.
              </p>
              <p style={{ fontSize: '10px', color: subtleText, marginTop: '2px' }}>
                This is an official receipt. Please keep it for your records.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', padding: '0 24px 24px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '14px',
              backgroundColor: `${textColor}15`,
              color: textColor,
              fontFamily: "'Poppins',sans-serif",
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: accentColor,
              color: '#fff',
              fontFamily: "'Poppins',sans-serif",
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Printer size={15} /> Print Receipt
          </button>
          <button
            onClick={handlePrint}
            style={{
              height: '44px',
              width: '44px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: primaryColor,
              color: '#fff',
              fontFamily: "'Poppins',sans-serif",
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Download size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
