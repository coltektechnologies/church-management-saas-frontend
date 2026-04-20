'use client';

/**
 * RecordIncomePage.tsx
 */

import { useState, useEffect, useCallback, startTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Settings2, History } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';

// ── Sub-components ────────────────────────────────────────────────────────────
import RecordIncomeForm from './RecordIncomeForm';
import IncomeReceipt, { type IncomeRecord } from './IncomeReceipt';
import IncomeEntryLog from './IncomeEntryLog';
import DropdownManager from './DropdownManager';
import ActivityHistoryPanel from './ActivityHistoryPanel';
import CurrencyConverterModal from './CurrencyConverterModal';
import SlideOverPanel from './SlideOverPanel';

// ── Data / helpers ────────────────────────────────────────────────────────────
import { loadRecords, saveRecords, getCurrencySymbol, type Member } from './recordIncomeData';
import { appendActivity } from './activityHistory';
import { getOptions, type DropdownOption } from './dropdownOptions';
import { getIncomeCategoriesStrict } from '@/lib/treasuryApi';
import { getMembersListStrict, type BackendMember } from '@/lib/dashboardApi';
import { submitTreasuryIncomeRecord } from '@/services/recordIncomeSubmit';

const TREASURY_RECORD_SAVED_EVENT = 'treasury:record-saved';

function toMemberRows(members: BackendMember[]): Member[] {
  return members.map((m) => {
    const name =
      (m.full_name && String(m.full_name).trim()) ||
      [m.first_name, m.last_name].filter(Boolean).join(' ') ||
      'Member';
    const phone = typeof m.phone_number === 'string' ? m.phone_number : '';
    const email = typeof m.email === 'string' ? m.email : '';
    const short = m.id.replace(/-/g, '').slice(0, 6).toUpperCase();
    return {
      id: m.id,
      name,
      phone,
      email,
      memberId: `ID ${short}`,
    };
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RecordIncomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useTreasuryProfile();
  const { profile: churchProfile } = useChurchProfile();

  const {
    data: rawCategories,
    isLoading: catLoading,
    isError: catError,
  } = useQuery({
    queryKey: ['treasury', 'record-income', 'categories'],
    queryFn: getIncomeCategoriesStrict,
  });

  const incomeCategoryOptions = useMemo<DropdownOption[]>(() => {
    if (!rawCategories?.length) {
      return [];
    }
    return rawCategories
      .filter((c) => c.is_active !== false)
      .map((c) => ({
        value: String(c.id),
        label: c.name,
        isDefault: false,
      }));
  }, [rawCategories]);

  const { data: backendMembers = [], isLoading: memLoading } = useQuery({
    queryKey: ['treasury', 'record-income', 'members'],
    queryFn: () => getMembersListStrict(250),
  });

  const pickerMembers = useMemo(() => toMemberRows(backendMembers), [backendMembers]);

  const formDisabled =
    catLoading ||
    memLoading ||
    catError ||
    incomeCategoryOptions.length === 0 ||
    pickerMembers.length === 0;

  // ── Theme ─────────────────────────────────────────────────────────────
  const isDark = profile.darkMode ?? false;
  const cardBg = isDark ? profile.darkBackgroundColor || '#0A1628' : '#FFFFFF';
  const pageBg = isDark
    ? profile.darkBackgroundColor || '#0B1D35'
    : profile.backgroundColor || '#EEF2F7';
  const textColor = isDark ? '#FFFFFF' : '#0B2A4A';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E0E5ED';
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const primaryColor = isDark
    ? profile.darkPrimaryColor || '#1A3F6B'
    : profile.primaryColor || '#0B2A4A';
  const churchName = churchProfile.churchName || 'Church Name';
  const churchAddress = churchProfile.address || 'Adress';
  const actor = profile.adminName || 'Position/Role';

  // ── Persistent records ─────────────────────────────────────────────────
  const [entryLog, setEntryLog] = useState<IncomeRecord[]>(() => loadRecords());
  const reloadEntryLog = useCallback(() => {
    setEntryLog(loadRecords());
  }, []);

  // Keep localStorage in sync whenever entryLog changes
  useEffect(() => {
    saveRecords(entryLog);
  }, [entryLog]);

  // Listen for records saved by /app/treasury/record-income/page.tsx
  useEffect(() => {
    window.addEventListener(TREASURY_RECORD_SAVED_EVENT, reloadEntryLog);
    return () => window.removeEventListener(TREASURY_RECORD_SAVED_EVENT, reloadEntryLog);
  }, [reloadEntryLog]);

  // Also listen for cross-tab localStorage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'treasury_income_records_v1') {
        reloadEntryLog();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [reloadEntryLog]);

  // ── Receipt modal ──────────────────────────────────────────────────────
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastRecord, setLastRecord] = useState<IncomeRecord | null>(null);

  // ── Slide-over panels ──────────────────────────────────────────────────
  const [showDropdownPanel, setShowDropdownPanel] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);

  // ── Currency converter ─────────────────────────────────────────────────
  const [showConverter, setShowConverter] = useState(false);

  // ── Derived flags ──────────────────────────────────────────────────────
  const isMultiCurrency = [...new Set(entryLog.map((r) => r.currency))].length > 1;

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleRecorded = async (draft: IncomeRecord) => {
    try {
      const created = await submitTreasuryIncomeRecord(draft);
      const record = { ...draft, id: created.id, receiptNumber: created.receipt_number };

      startTransition(() => {
        setEntryLog((prev) => {
          const next = [record, ...prev];
          saveRecords(next);
          return next;
        });
        setLastRecord(record);
        setShowReceipt(true);
      });

      const incomeTypeName =
        incomeCategoryOptions.find((o) => o.value === record.incomeType)?.label ??
        getOptions('income_types').find((o) => o.value === record.incomeType)?.label ??
        record.incomeType;

      appendActivity({
        action: 'income_recorded',
        category: 'income',
        actor,
        summary: `Recorded ${incomeTypeName}${record.incomeTypeDetail ? ` (${record.incomeTypeDetail})` : ''} of ${getCurrencySymbol(record.currency)}${record.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })} for ${record.memberName}`,
        detail: `Receipt: ${record.receiptNumber} · Date: ${record.date}`,
        relatedId: record.id,
        meta: {
          receiptNumber: record.receiptNumber,
          amount: record.amount,
          currency: record.currency,
          memberName: record.memberName,
          date: record.date,
        },
      });

      toast.success('Income recorded', {
        description: `${record.receiptNumber} saved successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['treasury'] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save income.';
      toast.error(message);
      throw err;
    }
  };

  const handleUpdateRecord = (updated: IncomeRecord) => {
    setEntryLog((prev) => {
      const old = prev.find((r) => r.id === updated.id);
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
      saveRecords(next);

      if (old) {
        const changes: string[] = [];
        if (old.amount !== updated.amount) {
          changes.push(
            `amount ${getCurrencySymbol(old.currency)}${old.amount} → ${getCurrencySymbol(updated.currency)}${updated.amount}`
          );
        }
        if (old.date !== updated.date) {
          changes.push(`date ${old.date} → ${updated.date}`);
        }

        appendActivity({
          action: 'income_edited',
          category: 'income',
          actor,
          summary: `Edited income record ${updated.receiptNumber} for ${updated.memberName}`,
          detail: changes.length > 0 ? changes.join('; ') : 'Record updated',
          relatedId: updated.id,
        });
      }
      return next;
    });
  };

  // ── Shared theme prop bag ──────────────────────────────────────────────
  const themeProps = { textColor, accentColor, cardBg, borderColor, primaryColor, isDark };

  // ── Nav button style ───────────────────────────────────────────────────
  const navBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    fontFamily: "'OV Soge', sans-serif",
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer',
    border: `1px solid ${borderColor}`,
    backgroundColor: 'transparent',
    color: textColor,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: pageBg }}>
      {/* ════════ Sticky top bar ════════ */}
      <div
        style={{
          backgroundColor: cardBg,
          borderBottom: `1px solid ${borderColor}`,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 clamp(16px,4vw,32px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: '52px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            style={navBtn}
            onClick={() => setShowDropdownPanel(true)}
            onMouseEnter={(e) => {
              const b = e.currentTarget;
              b.style.backgroundColor = `${accentColor}10`;
              b.style.borderColor = accentColor;
              b.style.color = accentColor;
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget;
              b.style.backgroundColor = 'transparent';
              b.style.borderColor = borderColor;
              b.style.color = textColor;
            }}
          >
            <Settings2 size={13} /> Manage Dropdowns
          </button>
          <button
            type="button"
            style={navBtn}
            onClick={() => setShowActivityPanel(true)}
            onMouseEnter={(e) => {
              const b = e.currentTarget;
              b.style.backgroundColor = `${accentColor}10`;
              b.style.borderColor = accentColor;
              b.style.color = accentColor;
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget;
              b.style.backgroundColor = 'transparent';
              b.style.borderColor = borderColor;
              b.style.color = textColor;
            }}
          >
            <History size={13} /> Activity
          </button>
        </div>
      </div>

      {/* ════════ Main content column ════════ */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: 'clamp(28px,4vw,44px) clamp(16px,4vw,32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {catError && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
              color: isDark ? '#FECACA' : '#991B1B',
              fontFamily: "'OV Soge', sans-serif",
              fontSize: '12px',
            }}
          >
            Could not load income categories. Check your connection and try refreshing the page.
          </div>
        )}

        {!catLoading && !catError && incomeCategoryOptions.length === 0 && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: `1px dashed ${borderColor}`,
              color: `${textColor}80`,
              fontFamily: "'OV Soge', sans-serif",
              fontSize: '12px',
            }}
          >
            No income categories are available. Add categories in treasury settings or ask an
            administrator.
          </div>
        )}

        {!memLoading && pickerMembers.length === 0 && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: `1px dashed ${borderColor}`,
              color: `${textColor}80`,
              fontFamily: "'OV Soge', sans-serif",
              fontSize: '12px',
            }}
          >
            No members found in your directory. Add members before recording income.
          </div>
        )}

        {/* Income entry form */}
        <RecordIncomeForm
          onRecorded={handleRecorded}
          onCancel={() => router.push('/treasury/approvals')}
          actor={actor}
          incomeCategoryOptions={
            incomeCategoryOptions.length > 0 ? incomeCategoryOptions : undefined
          }
          members={pickerMembers}
          disabled={formDisabled}
          {...themeProps}
        />

        {entryLog.length > 0 ? (
          <IncomeEntryLog
            records={entryLog}
            incomeTypeOptionsOverride={
              incomeCategoryOptions.length > 0 ? incomeCategoryOptions : undefined
            }
            onUpdateRecord={handleUpdateRecord}
            actor={actor}
            isMultiCurrency={isMultiCurrency}
            onShowConverter={() => setShowConverter(true)}
            {...themeProps}
          />
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 24px',
              borderRadius: '12px',
              border: `1px dashed ${borderColor}`,
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(11,42,74,0.03)',
            }}
          >
            <p
              style={{
                fontFamily: "'OV Soge',sans-serif",
                fontSize: '13px',
                color: `${textColor}45`,
                margin: 0,
              }}
            >
              No records yet — submit your first income entry above
            </p>
          </div>
        )}
      </div>

      {/* ════════ Slide-over panels ════════ */}
      <SlideOverPanel
        open={showDropdownPanel}
        onClose={() => setShowDropdownPanel(false)}
        title="Manage Dropdown Options"
        icon={<Settings2 size={16} />}
        pageBg={pageBg}
        {...themeProps}
      >
        <DropdownManager actor={actor} {...themeProps} />
      </SlideOverPanel>

      <SlideOverPanel
        open={showActivityPanel}
        onClose={() => setShowActivityPanel(false)}
        title="Activity History"
        icon={<History size={16} />}
        pageBg={pageBg}
        {...themeProps}
      >
        <ActivityHistoryPanel {...themeProps} />
      </SlideOverPanel>

      {/* ════════ Modals ════════ */}
      {showReceipt && lastRecord && (
        <IncomeReceipt
          record={lastRecord}
          churchName={churchName}
          churchAddress={churchAddress}
          onClose={() => setShowReceipt(false)}
          {...themeProps}
        />
      )}

      {showConverter && (
        <CurrencyConverterModal
          records={entryLog}
          onClose={() => setShowConverter(false)}
          {...themeProps}
        />
      )}
    </div>
  );
}
