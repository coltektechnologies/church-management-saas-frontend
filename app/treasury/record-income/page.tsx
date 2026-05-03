'use client';

/**
 * /app/treasury/record-income/page.tsx
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import RecordIncomeForm from '@/components/treasurydashboard/recordIncome/RecordIncomeForm';
import type { IncomeRecord } from '@/components/treasurydashboard/recordIncome/IncomeReceipt';

import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { appendActivity } from '@/components/treasurydashboard/recordIncome/activityHistory';
import { getOptions } from '@/components/treasurydashboard/recordIncome/dropdownOptions';
import { getCurrencySymbol } from '@/components/treasurydashboard/recordIncome/recordIncomeData';

// ── Shared storage key (must match IncomeEntryLog / RecordIncomePage) ─────────
const INCOME_RECORDS_KEY = 'treasury_income_records_v1';
export const TREASURY_RECORD_SAVED_EVENT = 'treasury:record-saved';

function loadRecordsFromStorage(): IncomeRecord[] {
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

function saveRecordToStorage(record: IncomeRecord): void {
  try {
    const existing = loadRecordsFromStorage();
    // newest first so IncomeEntryLog shows them in the right order
    localStorage.setItem(INCOME_RECORDS_KEY, JSON.stringify([record, ...existing]));
    // Notify any open RecordIncomePage tab/component immediately
    window.dispatchEvent(new CustomEvent(TREASURY_RECORD_SAVED_EVENT));
  } catch {
    // quota exceeded — ignore
  }
}

// ── Dropdown-change fingerprint ───────────────────────────────────────────────
function optionsFingerprint(): string {
  const types = getOptions('income_types')
    .map((o) => `${o.value}:${o.label}`)
    .join(',');
  const currencies = getOptions('currencies')
    .map((o) => `${o.value}:${o.label}`)
    .join(',');
  return `${types}|${currencies}`;
}

// ── autoText helper ───────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export default function RecordIncomePage() {
  const router = useRouter();
  const { profile, isReady } = useTreasuryProfile();

  // ── Theme ─────────────────────────────────────────────────────────────────
  const isDark = isReady ? (profile.darkMode ?? false) : false;
  const bgColor = isDark ? profile.darkBackgroundColor || '#0A1628' : '#F5F7FA';
  const cardBg = isDark ? profile.darkSidebarColor || '#0D1F36' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E0E5ED';
  const textColor = autoText(bgColor);
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const primaryColor = isDark
    ? profile.darkPrimaryColor || '#1A3F6B'
    : profile.primaryColor || '#0B2A4A';
  const actor = isReady ? profile.preferredName || profile.adminName || 'Treasurer' : 'Treasurer';

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);

  // ── Dropdown-change detection → remount form ──────────────────────────────
  const [formKey, setFormKey] = useState<number>(0);
  const fingerprintRef = useRef<string>('');

  useEffect(() => {
    fingerprintRef.current = optionsFingerprint();

    const id = window.setInterval(() => {
      const next = optionsFingerprint();
      if (next !== fingerprintRef.current) {
        fingerprintRef.current = next;
        setFormKey((k) => k + 1);
      }
    }, 1500);

    return () => window.clearInterval(id);
  }, []);

  // ── Record handler ────────────────────────────────────────────────────────
  const handleRecorded = useCallback(
    (record: IncomeRecord, _options?: { showReceipt?: boolean }) => {
      saveRecordToStorage(record);

      // 2. Log to activity history so ActivityHistoryPanel sees it.
      const incomeTypeName =
        getOptions('income_types').find((o) => o.value === record.incomeType)?.label ??
        record.incomeType;

      appendActivity({
        action: 'income_recorded',
        category: 'income',
        actor,
        summary: `Recorded ${incomeTypeName}${record.incomeTypeDetail ? ` (${record.incomeTypeDetail})` : ''} of ${getCurrencySymbol(record.currency)}${record.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })} for ${record.memberName}`,
        detail: `Receipt: ${record.receiptNumber} · Date: ${record.date} · Payment: ${record.paymentMethod}`,
        relatedId: record.id,
        meta: {
          receiptNumber: record.receiptNumber,
          amount: record.amount,
          currency: record.currency,
          memberName: record.memberName,
          date: record.date}});

      // 3. Toast confirmation
      setToast(`Receipt ${record.receiptNumber} saved successfully!`);
      setTimeout(() => setToast(null), 4000);
    },
    [actor]
  );

  const handleCancel = useCallback(() => {
    router.push('/treasury');
  }, [router]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100%',
        padding: 'clamp(12px, 3vw, 32px)',
        position: 'relative'}}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '12px 24px',
            borderRadius: 12,
            backgroundColor: accentColor,
            color: autoText(accentColor),
            fontWeight: 700,
            fontSize: 13,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'}}
        >
          ✓ {toast}
        </div>
      )}

      {/* Page heading */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(16px, 2.2vw, 22px)',
            color: textColor,
            margin: 0}}
        >
          Record Income
        </h1>
        <p
          style={{
            fontSize: 13,
            color: `${textColor}60`,
            margin: '4px 0 0'}}
        >
          Create and save individual or department income records
        </p>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 680, width: '100%' }}>
        <RecordIncomeForm
          key={formKey}
          onRecorded={handleRecorded}
          onCancel={handleCancel}
          textColor={textColor}
          accentColor={accentColor}
          cardBg={cardBg}
          borderColor={borderColor}
          _primaryColor={primaryColor}
          isDark={isDark}
          actor={actor}
        />
      </div>
    </div>
  );
}
