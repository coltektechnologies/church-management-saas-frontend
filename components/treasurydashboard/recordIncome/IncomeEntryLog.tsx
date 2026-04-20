'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ClipboardList, ChevronDown, ChevronUp, CheckCircle2,
  Search, Edit2, Save, X, Printer, FileText,
  FileSpreadsheet, Download, Filter, ChevronRight,
  AlertCircle, Tag, RefreshCw,
} from 'lucide-react';
import type { IncomeRecord } from './IncomeReceipt';
import { formatCurrency } from './IncomeReceipt';
import { getOptions } from './dropdownOptions';
import { appendActivity } from './activityHistory';

// ── Shared storage key — must match record-income/page.tsx ────────────────────
export const INCOME_RECORDS_KEY = 'treasury_income_records_v1';

export function loadAllRecords(): IncomeRecord[] {
  if (typeof window === 'undefined') { return []; }
  try {
    const raw = localStorage.getItem(INCOME_RECORDS_KEY);
    return raw ? (JSON.parse(raw) as IncomeRecord[]) : [];
  } catch {
    return [];
  }
}

function saveAllRecords(records: IncomeRecord[]): void {
  try {
    localStorage.setItem(INCOME_RECORDS_KEY, JSON.stringify(records));
  } catch { /* quota exceeded */ }
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

const TYPE_BADGES: Record<string, { bg: string; text: string }> = {
  tithe:        { bg: '#EFF6FF', text: '#1D4ED8' },
  offering:     { bg: '#F0FDF4', text: '#15803D' },
  thanksgiving: { bg: '#FFF7ED', text: '#C2410C' },
  harvest:      { bg: '#FDF4FF', text: '#7E22CE' },
  welfare:      { bg: '#FFF1F2', text: '#BE123C' },
  other:        { bg: '#F1F5F9', text: '#475569' },
};

function typeLabel(value: string): string {
  const opts = getOptions('income_types');
  return opts.find((o) => o.value === value)?.label ?? value;
}

function fullTypeLabel(r: IncomeRecord): string {
  const base = typeLabel(r.incomeType);
  return r.incomeTypeDetail ? `${base} — ${r.incomeTypeDetail}` : base;
}

function parseDMY(s: string): Date | null {
  const parts = s.split('/');
  if (parts.length !== 3) { return null; }
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) { return null; }
  return new Date(y, m - 1, d);
}

function getCurrencySymbol(code: string): string {
  const map: Record<string, string> = { GHS: '₵', USD: '$', EUR: '€', GBP: '£' };
  return map[code] ?? code;
}

// ── EditableField ─────────────────────────────────────────────────────────────
function EditableField({ label, value, editing, onChange, textColor, accentColor }: {
  label: string; value: string; editing: boolean;
  onChange: (v: string) => void; textColor: string; accentColor: string;
}) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '10px', color: `${textColor}60`, fontFamily: "'OV Soge',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = `${accentColor}60`; }}
          style={{ width: '100%', fontSize: '12px', fontFamily: "'OV Soge',sans-serif", fontWeight: 600, color: textColor, backgroundColor: `${accentColor}12`, border: `1.5px solid ${accentColor}60`, borderRadius: '6px', padding: '6px 10px', outline: 'none', caretColor: accentColor }}
        />
      ) : (
        <div style={{ fontSize: '12px', color: textColor, fontFamily: "'OV Soge',sans-serif", fontWeight: 600, padding: '2px 0', wordBreak: 'break-word' }}>
          {value || '—'}
        </div>
      )}
    </div>
  );
}

// ── EntryCard ─────────────────────────────────────────────────────────────────
function EntryCard({ record, cardBg, borderColor, accentColor, onSave, actor }: {
  record: IncomeRecord; cardBg: string; borderColor: string;
  accentColor: string; actor: string; onSave: (updated: IncomeRecord) => void;
}) {
  const [expanded,    setExpanded]    = useState(false);
  const [editing,     setEditing]     = useState(false);
  const [draft,       setDraft]       = useState<IncomeRecord>(record);
  const [justEntered, setJustEntered] = useState(false);

  const tc    = autoText(cardBg);
  const badge = TYPE_BADGES[record.incomeType] ?? TYPE_BADGES.other;

  const startEditing = () => {
    setEditing(true);
    setExpanded(true);
    setJustEntered(true);
    setTimeout(() => setJustEntered(false), 1600);
  };

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(record);
    setEditing(false);
  };

  const printSingle = () => {
    appendActivity({
      action:    'income_printed',
      category:  'income',
      actor,
      summary:   `Printed receipt ${record.receiptNumber} for ${record.memberName}`,
      relatedId: record.id,
    });

    const win = window.open('', '_blank', 'width=700,height=600');
    if (!win) { return; }
    const r = editing ? draft : record;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Receipt ${r.receiptNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Poppins',sans-serif;background:#fff;color:#0B2A4A;padding:40px}
        h1{font-size:20px;font-weight:700;text-align:center}
        .sub{font-size:11px;color:#888;text-align:center;margin-top:2px}
        .badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:10px;font-weight:600;background:#f0fdfb;color:#2FC4B2;margin-top:10px}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:12px}
        td:first-child{color:#888;font-weight:500;width:40%}
        td:last-child{font-weight:600;text-align:right}
        .amount{font-size:22px;font-weight:700;color:#0B2A4A}
        .footer{margin-top:24px;border-top:2px dashed #DFDADA;padding-top:12px;text-align:center;font-size:10px;color:#aaa}
      </style></head><body>
      <h1>Income Receipt</h1>
      <div class="sub">${r.receiptNumber}</div>
      <div style="text-align:center"><span class="badge">${fullTypeLabel(r)}</span></div>
      <table>
        <tr><td>Member</td><td>${r.memberName}</td></tr>
        <tr><td>Amount</td><td class="amount">${formatCurrency(r.amount, r.currency)}</td></tr>
        <tr><td>Date</td><td>${r.date}</td></tr>
        <tr><td>Income Type</td><td>${fullTypeLabel(r)}</td></tr>
        <tr><td>Payment</td><td>${r.paymentMethod}${r.paymentDetail ? ' (' + r.paymentDetail + ')' : ''}</td></tr>
        <tr><td>Notification</td><td>${r.notification.join(', ') || '—'}</td></tr>
        <tr><td>Recorded At</td><td>${r.recordedAt}</td></tr>
        <tr><td>Recorded By</td><td>${r.recordedBy}</td></tr>
      </table>
      <div class="footer">Official Income Record · Thank you for your contribution.</div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div style={{ backgroundColor: cardBg, border: `1px solid ${editing ? '#F59E0B' : borderColor}`, borderRadius: '10px', boxShadow: editing ? '0 0 0 2px rgba(245,158,11,0.22), 0 2px 10px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>

      {editing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: justEntered ? '#FEF08A' : '#FEF3C7', borderBottom: '1px solid #FDE68A', borderRadius: '10px 10px 0 0', transition: 'background-color 0.6s ease' }}>
          <AlertCircle size={14} style={{ color: '#D97706', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', fontFamily: "'OV Soge',sans-serif", flex: 1 }}>
            Editing this record — change the highlighted fields below, then click <strong>Save Changes</strong>.
          </span>
          <button onClick={handleCancel} style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, fontFamily: "'OV Soge',sans-serif", backgroundColor: '#FDE68A', color: '#92400E', border: '1px solid #FCD34D', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <X size={10} /> Discard
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: editing ? '#FEF3C7' : `${accentColor}20` }}>
            <CheckCircle2 size={18} style={{ color: editing ? '#D97706' : accentColor }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'OV Soge',sans-serif", fontWeight: 600, fontSize: '13px', color: tc }}>{record.memberName}</span>
              <span title={fullTypeLabel(record)} style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: badge.bg, color: badge.text, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                {fullTypeLabel(record)}
              </span>
              {editing && <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '20px', backgroundColor: '#FDE68A', color: '#92400E', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Editing</span>}
            </div>
            <div style={{ fontSize: '11px', marginTop: '2px', color: `${tc}70`, fontFamily: "'OV Soge',sans-serif" }}>
              {record.receiptNumber} · {record.date}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '16px', color: tc }}>
            {formatCurrency(record.amount, record.currency)}
          </span>
          <button onClick={printSingle} title="Print" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${accentColor}15`, color: accentColor, border: 'none', cursor: 'pointer' }}>
            <Printer size={13} />
          </button>
          <button onClick={startEditing} title="Edit" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: editing ? '#F59E0B' : `${tc}12`, color: editing ? '#fff' : tc, border: 'none', cursor: 'pointer', boxShadow: editing ? '0 0 0 3px rgba(245,158,11,0.28)' : 'none', transition: 'all 0.2s' }}>
            <Edit2 size={13} />
          </button>
          <button onClick={() => setExpanded((p) => !p)} style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${tc}10`, color: tc, border: 'none', cursor: 'pointer' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${editing ? '#FDE68A' : borderColor}` }}>
          {editing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#92400E', fontFamily: "'OV Soge',sans-serif", marginBottom: '12px' }}>
              <Edit2 size={12} style={{ color: '#D97706' }} />
              Highlighted fields are editable — others are locked for audit integrity.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <EditableField label="Date"           value={editing ? draft.date : record.date}                                                              editing={editing} onChange={(v) => setDraft((p) => ({ ...p, date: v }))}                                         textColor={tc} accentColor={accentColor} />
            <EditableField label="Income Type"    value={fullTypeLabel(editing ? draft : record)}                                                         editing={false}   onChange={() => {}}                                                                             textColor={tc} accentColor={accentColor} />
            <EditableField label="Amount"         value={editing ? String(draft.amount) : formatCurrency(record.amount, record.currency)}                 editing={editing} onChange={(v) => setDraft((p) => ({ ...p, amount: Number(v.replace(/[^0-9.]/g, '')) || 0 }))} textColor={tc} accentColor={accentColor} />
            <EditableField label="Payment Method" value={`${record.paymentMethod}${record.paymentDetail ? ` (${record.paymentDetail})` : ''}`}           editing={false}   onChange={() => {}}                                                                             textColor={tc} accentColor={accentColor} />
            <EditableField label="Receipt No."    value={record.receiptNumber}                                                                            editing={false}   onChange={() => {}}                                                                             textColor={tc} accentColor={accentColor} />
            <EditableField label="Notification"   value={record.notification.join(', ') || '—'}                                                          editing={false}   onChange={() => {}}                                                                             textColor={tc} accentColor={accentColor} />
            <EditableField label="Recorded By"    value={record.recordedBy}                                                                               editing={false}   onChange={() => {}}                                                                             textColor={tc} accentColor={accentColor} />
            <EditableField label="Recorded At"    value={record.recordedAt}                                                                               editing={false}   onChange={() => {}}                                                                             textColor={tc} accentColor={accentColor} />
          </div>
          {editing && (
            <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px dashed #FDE68A', marginTop: '12px' }}>
              <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, fontFamily: "'OV Soge',sans-serif", backgroundColor: accentColor, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: `0 2px 8px ${accentColor}40` }}>
                <Save size={13} /> Save Changes
              </button>
              <button onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, fontFamily: "'OV Soge',sans-serif", backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA', cursor: 'pointer' }}>
                <X size={13} /> Cancel Edit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Export helpers ────────────────────────────────────────────────────────────
function doExport(format: 'csv' | 'excel' | 'word' | 'json' | 'print', records: IncomeRecord[], actor: string): void {
  appendActivity({
    action:   format === 'print' ? 'export_print' : format === 'csv' ? 'export_csv' : format === 'excel' ? 'export_excel' : format === 'word' ? 'export_word' : 'export_json',
    category: 'export',
    actor,
    summary:  `Exported ${records.length} record(s) as ${format.toUpperCase()}`,
    meta:     { format, count: records.length },
  });

  if (format === 'csv') {
    const headers = ['Receipt No','Date','Member','Income Type','Detail','Amount','Currency','Payment','Notification','Recorded At','Recorded By'];
    const rows = records.map((r) => [r.receiptNumber, r.date, r.memberName, typeLabel(r.incomeType), r.incomeTypeDetail || '', r.amount, r.currency, r.paymentMethod, r.notification.join('; '), r.recordedAt, r.recordedBy]);
    const csv  = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'income_records.csv'; a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'excel') {
    const headers = ['Receipt No','Date','Member','Income Type','Detail','Amount','Currency','Payment','Notification','Recorded At','Recorded By'];
    const rows = records.map((r) => [r.receiptNumber, r.date, r.memberName, typeLabel(r.incomeType), r.incomeTypeDetail || '', r.amount, r.currency, r.paymentMethod, r.notification.join('; '), r.recordedAt, r.recordedBy]);
    const tsv  = [headers, ...rows].map((row) => row.join('\t')).join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'income_records.xls'; a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'word') {
    const rows = records.map((r) => `<tr><td>${r.receiptNumber}</td><td>${r.date}</td><td>${r.memberName}</td><td>${fullTypeLabel(r)}</td><td style="text-align:right;font-weight:600">${formatCurrency(r.amount, r.currency)}</td><td>${r.paymentMethod}</td><td>${r.notification.join(', ') || '—'}</td><td>${r.recordedBy}</td></tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>body{font-family:Calibri,sans-serif;font-size:11pt;color:#0B2A4A}h1{font-size:18pt;text-align:center}table{width:100%;border-collapse:collapse;font-size:9pt}th{background:#0B2A4A;color:#fff;padding:6pt 8pt;text-align:left}td{padding:5pt 8pt;border-bottom:1pt solid #e0e0e0}</style></head><body><h1>Income Records</h1><table><tr><th>Receipt No</th><th>Date</th><th>Member</th><th>Type</th><th>Amount</th><th>Payment</th><th>Notification</th><th>Recorded By</th></tr>${rows}</table></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'income_records.doc'; a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'income_records.json'; a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'print') {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { return; }
    const rows = records.map((r) => `<tr><td>${r.receiptNumber}</td><td>${r.date}</td><td>${r.memberName}</td><td>${fullTypeLabel(r)}</td><td style="text-align:right;font-weight:600">${formatCurrency(r.amount, r.currency)}</td><td>${r.paymentMethod}</td><td>${r.recordedBy}</td></tr>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>Income Records</title><style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Poppins',sans-serif;padding:32px;color:#0B2A4A}h1{font-size:20px;font-weight:700;margin-bottom:4px}.sub{font-size:11px;color:#888;margin-bottom:20px}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#0B2A4A;color:#fff;padding:8px 10px;text-align:left;font-weight:600}td{padding:7px 10px;border-bottom:1px solid #f0f0f0}@media print{body{padding:0}}</style></head><body><h1>Income Records</h1><div class="sub">Generated ${new Date().toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' })} · ${records.length} record(s)</div><table><tr><th>Receipt No</th><th>Date</th><th>Member</th><th>Type</th><th>Amount</th><th>Payment</th><th>Recorded By</th></tr>${rows}</table></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  }
}

// ── Per-currency totals ───────────────────────────────────────────────────────
function CurrencyTotals({ records, textColor, accentColor, isFiltered }: {
  records: IncomeRecord[]; textColor: string; accentColor: string; isFiltered: boolean;
}) {
  const byCurrency: Record<string, number> = {};
  records.forEach((r) => { byCurrency[r.currency] = (byCurrency[r.currency] ?? 0) + r.amount; });
  const entries = Object.entries(byCurrency);
  if (entries.length === 0) { return null; }
  return (
    <>
      {entries.map(([cur, total]) => {
        const sym = getCurrencySymbol(cur);
        return (
          <div key={cur} style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: `${accentColor}12`, border: `1px solid ${accentColor}25` }}>
            <div style={{ fontSize: '9px', color: accentColor, fontWeight: 700, fontFamily: "'OV Soge',sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {isFiltered ? 'Filtered' : 'Total'} ({cur})
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: textColor, fontFamily: "'Poppins',sans-serif" }}>
              {sym} {total.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── IncomeEntryLog ────────────────────────────────────────────────────────────
interface IncomeEntryLogProps {
  /**
   * Optional externally-managed records.
   */
  records?: IncomeRecord[];
  onUpdateRecord?: (updated: IncomeRecord) => void;
  actor?: string;
  primaryColor?: string;
  accentColor?: string;
  textColor?: string;
  cardBg?: string;
  borderColor?: string;
  isDark?: boolean;
  isMultiCurrency?: boolean;
  onShowConverter?: () => void;
}

export default function IncomeEntryLog({
  records: externalRecords,
  onUpdateRecord,
  actor           = 'Treasurer',
  primaryColor    = '#0B2A4A',
  accentColor     = '#2FC4B2',
  textColor       = '#0B2A4A',
  cardBg          = '#FFFFFF',
  borderColor     = '#DFDADA',
  isDark          = false,
  isMultiCurrency = false,
  onShowConverter,
}: IncomeEntryLogProps) {
  // ── Self-managed storage mode ─────────────────────────────────────────────
  const [storedRecords, setStoredRecords] = useState<IncomeRecord[]>(loadAllRecords);
  useEffect(() => {
    const id = window.setInterval(() => {
      setStoredRecords(loadAllRecords());
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  // Use external records if provided (backwards-compat), else use localStorage
  const records = externalRecords ?? storedRecords;

  // ── Update handler ────────────────────────────────────────────────────────
  const handleUpdateRecord = (updated: IncomeRecord) => {
    if (onUpdateRecord) {
      onUpdateRecord(updated);
    } else {
      // Self-managed: persist the edit
      const next = storedRecords.map((r) => (r.id === updated.id ? updated : r));
      saveAllRecords(next);
      setStoredRecords(next);
    }

    appendActivity({
      action:    'income_edited',
      category:  'income',
      actor,
      summary:   `Edited receipt ${updated.receiptNumber} for ${updated.memberName}`,
      detail:    `Amount: ${formatCurrency(updated.amount, updated.currency)}`,
      relatedId: updated.id,
    });
  };

  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo,   setFilterTo]   = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const incomeTypeOptions = getOptions('income_types');

  const otherDetails = useMemo(() => {
    const details = records
      .filter((r) => r.incomeType === 'other' && r.incomeTypeDetail)
      .map((r) => r.incomeTypeDetail as string);
    return [...new Set(details)];
  }, [records]);

  const filtered = useMemo(() => {
    let result = records;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.memberName.toLowerCase().includes(q)
          || r.receiptNumber.toLowerCase().includes(q)
          || typeLabel(r.incomeType).toLowerCase().includes(q)
          || (r.incomeTypeDetail ?? '').toLowerCase().includes(q)
          || r.date.includes(q)
          || r.recordedBy.toLowerCase().includes(q),
      );
    }
    if (filterType) {
      if (filterType.startsWith('__other__:')) {
        const detail = filterType.slice('__other__:'.length);
        result = result.filter((r) => r.incomeType === 'other' && r.incomeTypeDetail === detail);
      } else {
        result = result.filter((r) => r.incomeType === filterType);
      }
    }
    if (filterFrom) {
      const from = new Date(filterFrom);
      result = result.filter((r) => { const d = parseDMY(r.date); return d ? d >= from : true; });
    }
    if (filterTo) {
      const to = new Date(filterTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((r) => { const d = parseDMY(r.date); return d ? d <= to : true; });
    }
    return result;
  }, [records, search, filterType, filterFrom, filterTo]);

  const isFiltering = !!search || !!filterType || !!filterFrom || !!filterTo;

  const typesInRecords = useMemo(() => {
    const seen = new Set(records.map((r) => r.incomeType));
    return incomeTypeOptions.filter((t) => seen.has(t.value));
  }, [records, incomeTypeOptions]);

  const inputStyle: React.CSSProperties = {
    fontFamily: "'OV Soge', sans-serif",
    fontSize: '11px',
    fontWeight: 500,
    color: textColor,
    caretColor: textColor,
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${borderColor}`,
    borderRadius: '8px',
    outline: 'none',
    padding: '8px 12px',
  };

  const pillStyle = (active: boolean, custom = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: custom ? '4px 10px' : '5px 12px',
    borderRadius: '20px',
    fontSize: custom ? '10px' : '11px',
    fontFamily: "'OV Soge',sans-serif",
    fontWeight: 700,
    border: `1px ${custom ? 'dashed' : 'solid'} ${active ? accentColor : borderColor}`,
    backgroundColor: active ? `${accentColor}18` : 'transparent',
    color: active ? accentColor : `${textColor}60`,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={16} style={{ color: primaryColor }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: '14px', color: textColor, margin: 0 }}>Income Entry Log</h3>
            <p style={{ fontSize: '11px', color: `${textColor}70`, fontFamily: "'Poppins',sans-serif", margin: 0 }}>
              {records.length} record{records.length !== 1 ? 's' : ''} total
              {isFiltering && filtered.length !== records.length && (
                <span style={{ color: accentColor, fontWeight: 600 }}> · {filtered.length} shown</span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isMultiCurrency && onShowConverter && (
            <button onClick={onShowConverter} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontFamily: "'OV Soge',sans-serif", fontWeight: 600, cursor: 'pointer', border: `1px solid ${accentColor}50`, backgroundColor: `${accentColor}12`, color: accentColor }}>
              <RefreshCw size={12} /> Convert Currencies
            </button>
          )}
          {isFiltering ? (
            <CurrencyTotals records={filtered} textColor={textColor} accentColor={accentColor} isFiltered />
          ) : (
            <CurrencyTotals records={records} textColor={textColor} accentColor={accentColor} isFiltered={false} />
          )}
        </div>
      </div>

      {/* Search + toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: `${textColor}50` }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, type, description, receipt…" style={{ ...inputStyle, paddingLeft: '30px', width: '100%' }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: `${textColor}50`, display: 'flex', padding: '2px' }}>
              <X size={11} />
            </button>
          )}
        </div>

        <button onClick={() => setShowFilter((p) => !p)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontFamily: "'OV Soge',sans-serif", fontWeight: 600, cursor: 'pointer', border: `1px solid ${showFilter || filterFrom || filterTo ? accentColor : borderColor}`, backgroundColor: showFilter || filterFrom || filterTo ? `${accentColor}15` : 'transparent', color: showFilter || filterFrom || filterTo ? accentColor : `${textColor}70` }}>
          <Filter size={12} /> Date Filter
          {(filterFrom || filterTo) && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accentColor, display: 'inline-block' }} />}
        </button>

        <div ref={exportRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowExport((p) => !p)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontFamily: "'OV Soge',sans-serif", fontWeight: 600, cursor: 'pointer', border: `1px solid ${borderColor}`, backgroundColor: 'transparent', color: `${textColor}70` }}>
            <Download size={12} /> Export
            <ChevronRight size={11} style={{ transform: showExport ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
          {showExport && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50, backgroundColor: isDark ? '#1a2a3a' : '#FFFFFF', border: `1px solid ${accentColor}40`, borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '178px', overflow: 'hidden' }}>
              {([
                { label: 'Print / PDF',        icon: <Printer size={13} />,         fmt: 'print'  },
                { label: 'Export CSV',          icon: <FileText size={13} />,        fmt: 'csv'    },
                { label: 'Export Excel (XLS)',  icon: <FileSpreadsheet size={13} />, fmt: 'excel'  },
                { label: 'Export Word (DOC)',   icon: <FileText size={13} />,        fmt: 'word'   },
                { label: 'Export JSON',         icon: <Download size={13} />,        fmt: 'json'   },
              ] as { label: string; icon: React.ReactNode; fmt: 'print' | 'csv' | 'excel' | 'word' | 'json' }[]).map((item) => (
                <button key={item.label} onClick={() => { doExport(item.fmt, filtered, actor); setShowExport(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '12px', fontFamily: "'OV Soge',sans-serif", fontWeight: 500, color: textColor, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${accentColor}12`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ color: accentColor }}>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Type filter pills */}
      {typesInRecords.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: `${textColor}55`, fontFamily: "'OV Soge',sans-serif", textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Tag size={10} /> Filter by Income Type
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button onClick={() => setFilterType('')} style={pillStyle(!filterType)}>All</button>
            {typesInRecords.map((t) => (
              <button key={t.value} onClick={() => setFilterType(filterType === t.value ? '' : t.value)} style={pillStyle(filterType === t.value)}>
                {t.label}
              </button>
            ))}
            {filterType === 'other' && otherDetails.length > 0 && (
              <>
                <span style={{ fontSize: '10px', color: `${textColor}40`, fontFamily: "'OV Soge',sans-serif", alignSelf: 'center' }}>↳ by detail:</span>
                {otherDetails.map((detail) => {
                  const detailKey = `__other__:${detail}`;
                  return (
                    <button key={detail} onClick={() => setFilterType(filterType === detailKey ? 'other' : detailKey)} style={pillStyle(filterType === detailKey, true)} title={`Show only: Other — ${detail}`}>
                      {detail}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* Date range */}
      {showFilter && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20`, marginBottom: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '10px', color: `${textColor}60`, fontWeight: 700, fontFamily: "'OV Soge',sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>From Date</div>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={{ ...inputStyle, width: '100%', colorScheme: isDark ? 'dark' : 'light' }} />
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '10px', color: `${textColor}60`, fontWeight: 700, fontFamily: "'OV Soge',sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>To Date</div>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={{ ...inputStyle, width: '100%', colorScheme: isDark ? 'dark' : 'light' }} />
          </div>
          {(filterFrom || filterTo) && (
            <button onClick={() => { setFilterFrom(''); setFilterTo(''); }} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontFamily: "'OV Soge',sans-serif", fontWeight: 500, cursor: 'pointer', border: `1px solid ${borderColor}`, backgroundColor: 'transparent', color: `${textColor}70`, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <X size={11} /> Clear Dates
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {isFiltering && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', color: `${textColor}50`, fontFamily: "'OV Soge',sans-serif", fontWeight: 600 }}>Active:</span>
          {search && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontFamily: "'OV Soge',sans-serif", fontWeight: 600, backgroundColor: `${accentColor}15`, color: accentColor }}>
              &ldquo;{search}&rdquo;
              <button onClick={() => setSearch('')} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: accentColor, display: 'flex' }}><X size={9} /></button>
            </span>
          )}
          {filterType && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontFamily: "'OV Soge',sans-serif", fontWeight: 600, backgroundColor: `${accentColor}15`, color: accentColor }}>
              {filterType.startsWith('__other__:') ? filterType.slice('__other__:'.length) : typeLabel(filterType)}
              <button onClick={() => setFilterType('')} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: accentColor, display: 'flex' }}><X size={9} /></button>
            </span>
          )}
          {filterFrom && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontFamily: "'OV Soge',sans-serif", fontWeight: 600, backgroundColor: `${accentColor}15`, color: accentColor }}>
              From {filterFrom} <button onClick={() => setFilterFrom('')} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: accentColor, display: 'flex' }}><X size={9} /></button>
            </span>
          )}
          {filterTo && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontFamily: "'OV Soge',sans-serif", fontWeight: 600, backgroundColor: `${accentColor}15`, color: accentColor }}>
              To {filterTo} <button onClick={() => setFilterTo('')} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: accentColor, display: 'flex' }}><X size={9} /></button>
            </span>
          )}
          <button onClick={() => { setSearch(''); setFilterType(''); setFilterFrom(''); setFilterTo(''); }} style={{ fontSize: '10px', fontFamily: "'OV Soge',sans-serif", fontWeight: 700, color: '#DC2626', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '3px 6px' }}>
            Clear all
          </button>
        </div>
      )}

      {/* Record list */}
      {records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: `${textColor}05`, border: `1px dashed ${borderColor}`, borderRadius: '8px' }}>
          <ClipboardList size={32} style={{ color: `${textColor}25`, margin: '0 auto 8px' }} />
          <p style={{ fontSize: '13px', color: `${textColor}50`, fontFamily: "'OV Soge',sans-serif" }}>No records yet — use Record Income to add your first entry.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 20px', backgroundColor: `${textColor}05`, border: `1px dashed ${borderColor}`, borderRadius: '8px' }}>
          <Search size={28} style={{ color: `${textColor}25`, margin: '0 auto 8px' }} />
          <p style={{ fontSize: '13px', color: `${textColor}50`, fontFamily: "'OV Soge',sans-serif" }}>No records match your filters</p>
          <button onClick={() => { setSearch(''); setFilterType(''); setFilterFrom(''); setFilterTo(''); }} style={{ marginTop: '8px', fontSize: '11px', fontFamily: "'OV Soge',sans-serif", fontWeight: 700, color: accentColor, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Clear all filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((r) => (
            <EntryCard
              key={r.id}
              record={r}
              cardBg={cardBg === '#FFFFFF' ? '#F9FAFB' : isDark ? `${cardBg}CC` : '#F9FAFB'}
              borderColor={borderColor}
              accentColor={accentColor}
              actor={actor}
              onSave={handleUpdateRecord}
            />
          ))}
        </div>
      )}
    </div>
  );
}