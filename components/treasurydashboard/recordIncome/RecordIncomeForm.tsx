'use client';

/**
 * RecordIncomeForm.tsx
 */

import { useState, useRef, useEffect, useId } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Search,
  Save,
  Printer,
  Banknote,
  Smartphone,
  Building2,
  CreditCard,
  FileText,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import type { IncomeRecord } from './IncomeReceipt';
import { todayDMY, nowString, DUMMY_MEMBERS, type Member } from './recordIncomeData';
import { getOptions, type DropdownOption as StoredDropdownOption } from './dropdownOptions';
import { getTreasuryMemberPledges, type TreasuryMemberPledgeRow } from '@/lib/treasuryApi';

// ── Static option lists (payment method details) ──────────
const MOMO_NETWORKS = [
  { value: 'mtn', label: 'MTN Mobile Money' },
  { value: 'telecel', label: 'Telecel Cash' },
  { value: 'airteltigo', label: 'AirtelTigo Money' },
];

const BANK_TRANSFER_TYPES = [
  { value: 'cashier_check', label: 'Cashier Check' },
  { value: 'bank_system', label: 'Bank System Transfer' },
];

const NOTIFICATION_TYPES = [
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Both' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function lettersOnly(v: string) {
  return v.replace(/[^a-zA-Z\s'-]/g, '');
}

// ── Style factories ───────────────────────────────────────────────────────────
function fieldLabel(textColor: string): React.CSSProperties {
  return {
    fontFamily: "'OV Soge', sans-serif",
    fontWeight: 500,
    fontSize: 'clamp(11px, 1.2vw, 13px)',
    color: textColor,
  };
}

function inputBase(
  _cardBg: string,
  textColor: string,
  borderColor: string,
  focused: boolean,
  error?: boolean,
  isDark?: boolean
): React.CSSProperties {
  return {
    fontFamily: "'OV Soge', sans-serif",
    fontWeight: 500,
    fontSize: 'clamp(11px, 1.2vw, 12px)',
    color: textColor,
    caretColor: textColor,
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${error ? '#FF0D0D' : focused ? '#2FC4B2' : borderColor}`,
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    padding: '12px 14px',
    transition: 'border-color 0.15s ease',
  };
}

// ── Searchable Dropdown ───────────────────────────────────────────────────────
interface SearchableOption {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: SearchableOption[];
  placeholder: string;
  searchable?: boolean;
  cardBg: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  isDark?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
}

function SearchableDropdown({
  id,
  value,
  onChange,
  options,
  placeholder,
  searchable = true,
  cardBg,
  textColor,
  borderColor,
  accentColor,
  isDark = false,
  error,
  icon,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;
  const dropBg = isDark ? '#1a2a3a' : '#FFFFFF';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        id={id}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputBase(cardBg, textColor, borderColor, focused || open, error, isDark),
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          paddingRight: '40px',
          textAlign: 'left',
        }}
      >
        {icon && <span style={{ color: textColor, flexShrink: 0 }}>{icon}</span>}
        <span
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: selected ? textColor : `${textColor}55`,
          }}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            position: 'absolute',
            right: '14px',
            color: `${textColor}60`,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: dropBg,
            border: `1px solid ${isDark ? `${accentColor}50` : `${accentColor}40`}`,
            borderRadius: '8px',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {searchable && (
            <div
              style={{
                padding: '8px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : borderColor}`,
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search
                  size={13}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: `${textColor}50`,
                  }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search…"
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 28px',
                    fontSize: '11px',
                    fontFamily: "'OV Soge', sans-serif",
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : borderColor}`,
                    borderRadius: '6px',
                    color: textColor,
                    caretColor: textColor,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '12px',
                  fontSize: '11px',
                  color: `${textColor}50`,
                  textAlign: 'center',
                  fontFamily: "'OV Soge', sans-serif",
                }}
              >
                No results
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setQuery('');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: 'clamp(11px, 1.2vw, 12px)',
                    fontFamily: "'OV Soge', sans-serif",
                    fontWeight: value === opt.value ? 600 : 400,
                    color: value === opt.value ? accentColor : textColor,
                    backgroundColor: value === opt.value ? `${accentColor}15` : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== opt.value) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                        ? 'rgba(255,255,255,0.06)'
                        : `${textColor}08`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      value === opt.value ? `${accentColor}15` : 'transparent';
                  }}
                >
                  {opt.label}
                  {value === opt.value && <Check size={13} style={{ color: accentColor }} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Notification picker ───────────────────────────────────────────────────────
function NotificationPicker({
  value,
  onChange,
  textColor,
  accentColor,
  borderColor,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  textColor: string;
  accentColor: string;
  borderColor: string;
}) {
  const toggle = (v: string) => {
    if (v === 'both') {
      onChange(['sms', 'email']);
      return;
    }
    const next = value.includes(v)
      ? value.filter((x) => x !== v)
      : [...value.filter((x) => x !== 'both'), v];
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {NOTIFICATION_TYPES.map((n) => {
        const active =
          n.value === 'both'
            ? value.includes('sms') && value.includes('email')
            : value.includes(n.value);
        return (
          <button
            key={n.value}
            type="button"
            onClick={() => toggle(n.value)}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              fontSize: 'clamp(11px, 1.1vw, 12px)',
              fontFamily: "'OV Soge', sans-serif",
              fontWeight: 500,
              border: `1px solid ${active ? accentColor : borderColor}`,
              backgroundColor: active ? `${accentColor}18` : 'transparent',
              color: active ? accentColor : `${textColor}70`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            {active && <Check size={11} />}
            {n.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  children,
  textColor,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  textColor: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{ ...fieldLabel(textColor), display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        {label}
        {required && <span style={{ color: '#FF0D0D', fontWeight: 700 }}>*</span>}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontSize: '11px',
            color: '#FF0D0D',
            fontFamily: "'OV Soge', sans-serif",
            margin: 0,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ── Text input ────────────────────────────────────────────────────────────────
function TextInput({
  value,
  onChange,
  placeholder,
  cardBg,
  textColor,
  borderColor,
  error,
  isDark,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  cardBg: string;
  textColor: string;
  borderColor: string;
  error?: boolean;
  isDark?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => onChange(e.target.value)}
      style={inputBase(cardBg, textColor, borderColor, focused, error, isDark)}
    />
  );
}

// ── Cancel confirm dialog ─────────────────────────────────────────────────────
function CancelConfirmDialog({
  onConfirm,
  onStay,
  textColor,
  cardBg,
  borderColor,
}: {
  onConfirm: () => void;
  onStay: () => void;
  textColor: string;
  cardBg: string;
  borderColor: string;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FFF3CD',
              border: '2px solid #FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={28} style={{ color: '#D97706' }} />
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: '16px',
                color: textColor,
                margin: '0 0 6px',
              }}
            >
              Cancel Income Record?
            </h3>
            <p
              style={{
                fontFamily: "'OV Soge',sans-serif",
                fontSize: '12px',
                color: `${textColor}70`,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Are you sure? All unsaved form information will be lost.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button
              onClick={onStay}
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '8px',
                fontFamily: "'OV Soge',sans-serif",
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: `${textColor}12`,
                color: textColor,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Keep Editing
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '8px',
                fontFamily: "'OV Soge',sans-serif",
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: '#DC2626',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
export type RecordIncomeSaveOptions = {
  /** When true, parent opens the receipt UI after a successful save (e.g. print dialog). */
  showReceipt?: boolean;
};

export interface RecordIncomeFormProps {
  onRecorded: (record: IncomeRecord, options?: RecordIncomeSaveOptions) => void | Promise<void>;
  onCancel: () => void;
  textColor?: string;
  accentColor?: string;
  cardBg?: string;
  borderColor?: string;
  _primaryColor?: string;
  isDark?: boolean;
  actor?: string;
  /** When provided, income type values are category UUIDs from the API (labels shown in UI). */
  incomeCategoryOptions?: StoredDropdownOption[];
  /** When provided, replaces demo members (expects real member UUIDs for API submit). */
  members?: Member[];
  /** Disable actions while parent is loading categories/members or API is unreachable. */
  disabled?: boolean;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RecordIncomeForm({
  onRecorded,
  onCancel,
  textColor = '#0B2A4A',
  accentColor = '#2FC4B2',
  cardBg = '#FFFFFF',
  borderColor = '#E0E5ED',
  isDark = false,
  actor = 'Treasurer',
  incomeCategoryOptions,
  members,
  disabled = false,
}: RecordIncomeFormProps) {
  const uid = useId();

  // ── Live options — re-read from localStorage on every render ─────────────
  const incomeTypeOptions = incomeCategoryOptions ?? getOptions('income_types');
  const currencyOptions = getOptions('currencies').map((o) => ({
    value: o.value,
    label: o.label.split(' — ')[0] ?? o.label,
  }));

  // ── Form state ──────────────────────────────────────────────────────────
  const [date, setDate] = useState<string>(() => (typeof window === 'undefined' ? '' : todayDMY()));
  const [receiptNumber, setReceiptNumber] = useState('');

  // ── FIX: Derive a safe incomeType — if the stored value no longer exists
  //         in the live options list, treat it as empty. No effect needed.
  const [incomeTypeRaw, setIncomeType] = useState('');
  const incomeType = incomeTypeOptions.some((o) => o.value === incomeTypeRaw) ? incomeTypeRaw : '';

  const [harvestDetail, setHarvestDetail] = useState('');
  const [pledgeOccasion, setPledgeOccasion] = useState('');
  const [otherDetail, setOtherDetail] = useState('');

  const [memberId, setMemberId] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [memberOpen, setMemberOpen] = useState(false);
  const [pledgeId, setPledgeId] = useState('');
  const [pledgeRows, setPledgeRows] = useState<TreasuryMemberPledgeRow[]>([]);
  const [pledgesLoading, setPledgesLoading] = useState(false);
  const memberRef = useRef<HTMLDivElement>(null);
  const memberInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState('');

  // ── FIX: Derive a safe currency — if the stored value is no longer in the
  //         live options list, fall back to the first option or 'GHS'.
  const [currencyRaw, setCurrency] = useState('GHS');
  const currency = currencyOptions.some((o) => o.value === currencyRaw)
    ? currencyRaw
    : (currencyOptions[0]?.value ?? 'GHS');

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [momoNetwork, setMomoNetwork] = useState('');
  const [momoTxId, setMomoTxId] = useState('');
  const [momoName, setMomoName] = useState('');
  const [bankTransferType, setBankTransferType] = useState('');
  const [checkId, setCheckId] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankTxId, setBankTxId] = useState('');
  const [notification, setNotification] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memberList = members !== undefined ? members : DUMMY_MEMBERS;

  const selectedIncomeLabel = incomeTypeOptions.find((o) => o.value === incomeType)?.label ?? '';
  const harvestLike =
    incomeType === 'harvest' ||
    (selectedIncomeLabel.length > 0 &&
      /\bharvest\b|\bpledge\b|\bannual\s+harvest\b/i.test(selectedIncomeLabel));
  const otherLike =
    incomeType === 'other' ||
    (selectedIncomeLabel.length > 0 && /\bother\b|\bmisc/i.test(selectedIncomeLabel));

  const selectedMember = memberList.find((m) => m.id === memberId);
  const filteredMembers = memberList.filter(
    (m) =>
      m.name.toLowerCase().includes(memberQuery.toLowerCase()) ||
      m.memberId.toLowerCase().includes(memberQuery.toLowerCase())
  );

  const selectedCurrencyLabel =
    getOptions('currencies').find((c) => c.value === currency)?.label ?? '₵ GHS';
  const currencySymbol = selectedCurrencyLabel.charAt(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (memberRef.current && !memberRef.current.contains(e.target as Node)) {
        setMemberOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!memberId) {
      setPledgeRows([]);
      setPledgeId('');
      return;
    }
    let cancelled = false;
    setPledgesLoading(true);
    void getTreasuryMemberPledges(memberId)
      .then((rows) => {
        if (!cancelled) {
          setPledgeRows(rows);
          setPledgeId('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPledgeRows([]);
          setPledgeId('');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPledgesLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!date.trim()) {
      e.date = 'Date is required';
    }
    if (!incomeType) {
      e.incomeType = 'Income type is required';
    }
    if (harvestLike && !harvestDetail) {
      e.harvestDetail = 'Please enter the harvest name';
    }
    if (otherLike && !otherDetail) {
      e.otherDetail = 'Please describe the income type';
    }
    if (!memberId && !contributorName.trim()) {
      e.member = 'Select a member from the list or enter a contributor name below';
    }
    if (!amount || Number(amount) <= 0) {
      e.amount = 'Enter a valid amount';
    }
    if (paymentMethod === 'momo') {
      if (!momoNetwork) {
        e.momoNetwork = 'Select a network';
      }
      if (!momoTxId) {
        e.momoTxId = 'Enter transaction ID';
      }
      if (!momoName) {
        e.momoName = 'Enter MoMo account name';
      }
    }
    if (paymentMethod === 'bank_transfer') {
      if (!bankTransferType) {
        e.bankTransferType = 'Select transfer type';
      }
      if (!bankName) {
        e.bankName = 'Enter bank name';
      }
      if (bankTransferType === 'cashier_check' && !checkId) {
        e.checkId = 'Enter check ID';
      }
      if (bankTransferType === 'bank_system' && !bankTxId) {
        e.bankTxId = 'Enter transaction ID';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPaymentDetail = (): string => {
    if (paymentMethod === 'momo') {
      return `${momoNetwork.toUpperCase()} · ${momoName} · Tx: ${momoTxId}`;
    }
    if (paymentMethod === 'bank_transfer') {
      if (bankTransferType === 'cashier_check') {
        return `Cashier Check · Check: ${checkId} · ${bankName}`;
      }
      return `Bank System · ${bankName} · Tx: ${bankTxId}`;
    }
    return '';
  };

  const buildIncomeTypeDetail = (): string => {
    if (incomeType === 'harvest') {
      return [harvestDetail, pledgeOccasion].filter(Boolean).join(' — Pledge: ');
    }
    if (incomeType === 'other') {
      return otherDetail;
    }
    return '';
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const buildIncomeRecord = (): IncomeRecord => ({
    id: crypto.randomUUID(),
    date,
    incomeType,
    incomeTypeDetail: buildIncomeTypeDetail(),
    memberId,
    memberName: selectedMember?.name?.trim() || contributorName.trim() || '—',
    pledgeId: pledgeId.trim() || undefined,
    amount: Number(amount),
    currency,
    paymentMethod,
    paymentDetail: buildPaymentDetail(),
    receiptNumber: receiptNumber.trim() || 'Pending',
    notification,
    recordedAt: nowString(),
    recordedBy: actor,
  });

  const resetAfterSuccessfulSave = () => {
    setIncomeType('');
    setHarvestDetail('');
    setPledgeOccasion('');
    setOtherDetail('');
    setMemberId('');
    setContributorName('');
    setMemberQuery('');
    setPledgeId('');
    setPledgeRows([]);
    setAmount('');
    setCurrency('GHS');
    setPaymentMethod('cash');
    setMomoNetwork('');
    setMomoTxId('');
    setMomoName('');
    setBankTransferType('');
    setCheckId('');
    setBankName('');
    setBankTxId('');
    setNotification([]);
    setErrors({});
    setReceiptNumber('');
  };

  const handleSave = async (showReceiptAfterSave: boolean) => {
    if (!validate()) {
      return;
    }
    const record = buildIncomeRecord();

    setIsSubmitting(true);
    try {
      await Promise.resolve(onRecorded(record, { showReceipt: showReceiptAfterSave }));
      resetAfterSuccessfulSave();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    const isDirty =
      incomeType ||
      memberId ||
      contributorName.trim() ||
      amount ||
      momoTxId ||
      momoName ||
      bankName ||
      bankTxId ||
      checkId ||
      otherDetail ||
      harvestDetail ||
      pledgeId;
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const dp = { cardBg, textColor, borderColor, accentColor, isDark };

  return (
    <>
      <div
        id="treasury-record-income-form"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          boxShadow: isDark ? '0 4px 28px rgba(0,0,0,0.32)' : '0 2px 20px rgba(11,42,74,0.07)',
          overflow: 'hidden',
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: '22px 28px',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: `${accentColor}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={18} style={{ color: accentColor }} />
          </div>
          <div>
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: '16px',
                color: textColor,
                margin: 0,
              }}
            >
              Record Income
            </h2>
            <p
              style={{
                fontFamily: "'OV Soge', sans-serif",
                fontSize: '11px',
                color: `${textColor}55`,
                margin: '2px 0 0',
              }}
            >
              Create, submit and print your individual or department records
            </p>
          </div>
        </div>

        {/* Form body */}
        <div
          style={{
            padding: '26px 28px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Date + Receipt */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
            className="ri-two-col"
          >
            <Field label="Date" required textColor={textColor} error={errors.date}>
              <div style={{ position: 'relative' }}>
                <CalendarDays
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: `${textColor}55`,
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="date"
                  value={date.split('/').reverse().join('-')}
                  onChange={(e) => {
                    const [y, m, d] = e.target.value.split('-');
                    if (y && m && d) {
                      setDate(`${d}/${m}/${y}`);
                    }
                  }}
                  style={{
                    ...inputBase(cardBg, textColor, borderColor, false, !!errors.date, isDark),
                    paddingLeft: '36px',
                    colorScheme: isDark ? 'dark' : 'light',
                  }}
                />
              </div>
            </Field>

            <Field label="Receipt Number" textColor={textColor}>
              <div style={{ position: 'relative' }}>
                <FileText
                  size={13}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: `${textColor}35`,
                  }}
                />
                <input
                  readOnly
                  value={receiptNumber || '(assigned when saved)'}
                  style={{
                    ...inputBase(cardBg, textColor, borderColor, false, false, isDark),
                    paddingLeft: '34px',
                    opacity: 0.55,
                    cursor: 'default',
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: '10px',
                  color: `${textColor}40`,
                  fontFamily: "'OV Soge',sans-serif",
                  margin: 0,
                }}
              >
                Auto-generated · unique per transaction
              </p>
            </Field>
          </div>

          {/* ── Income Type — LIVE from dropdownOptions ── */}
          <Field label="Income Type" required textColor={textColor} error={errors.incomeType}>
            <SearchableDropdown
              id={`${uid}-income-type`}
              value={incomeType}
              onChange={setIncomeType}
              options={incomeTypeOptions}
              placeholder="Select Income Type"
              {...dp}
              error={!!errors.incomeType}
            />
          </Field>

          {harvestLike && (
            <div
              style={{
                paddingLeft: '14px',
                borderLeft: `3px solid ${accentColor}40`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <Field
                label="Harvest Name / Event"
                required
                textColor={textColor}
                error={errors.harvestDetail}
              >
                <TextInput
                  value={harvestDetail}
                  onChange={setHarvestDetail}
                  placeholder="e.g. Annual Church Harvest 2025"
                  {...dp}
                  error={!!errors.harvestDetail}
                />
              </Field>
              <Field label="Pledge Occasion (optional)" textColor={textColor}>
                <TextInput
                  value={pledgeOccasion}
                  onChange={setPledgeOccasion}
                  placeholder="e.g. Building Fund pledge made on 12 Jan"
                  {...dp}
                />
              </Field>
            </div>
          )}

          {otherLike && (
            <div style={{ paddingLeft: '14px', borderLeft: `3px solid ${accentColor}40` }}>
              <Field
                label="Describe Income Type"
                required
                textColor={textColor}
                error={errors.otherDetail}
              >
                <TextInput
                  value={otherDetail}
                  onChange={setOtherDetail}
                  placeholder="e.g. Funeral Donation, Building Fund…"
                  {...dp}
                  error={!!errors.otherDetail}
                />
              </Field>
            </div>
          )}

          {/* ── Member / contributor ── */}
          <Field label="Member" required={false} textColor={textColor} error={errors.member}>
            <div ref={memberRef} style={{ position: 'relative' }}>
              <div
                style={{
                  ...inputBase(cardBg, textColor, borderColor, memberOpen, !!errors.member, isDark),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  paddingRight: '40px',
                }}
                onClick={() => {
                  setMemberOpen((o) => !o);
                  setTimeout(() => memberInputRef.current?.focus(), 50);
                }}
              >
                <Search size={14} style={{ color: `${textColor}55`, flexShrink: 0 }} />
                {selectedMember ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        color: textColor,
                        fontFamily: "'OV Soge', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {selectedMember.name}
                    </span>
                    <span style={{ fontSize: '10px', color: `${textColor}45` }}>
                      {selectedMember.memberId}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMemberId('');
                        setMemberQuery('');
                      }}
                      style={{
                        marginLeft: 'auto',
                        color: `${textColor}45`,
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                        border: 'none',
                        display: 'flex',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <input
                    ref={memberInputRef}
                    type="text"
                    value={memberQuery}
                    onChange={(e) => {
                      setMemberQuery(e.target.value);
                      setMemberOpen(true);
                    }}
                    placeholder={
                      memberList.length === 0
                        ? 'No directory members — use contributor name below'
                        : 'Search or select member'
                    }
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '12px',
                      color: textColor,
                      caretColor: textColor,
                      fontFamily: "'OV Soge', sans-serif",
                      minWidth: 0,
                    }}
                  />
                )}
              </div>
              <ChevronDown
                size={14}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: `translateY(-50%) rotate(${memberOpen ? 180 : 0}deg)`,
                  color: `${textColor}55`,
                  transition: 'transform 0.2s',
                  pointerEvents: 'none',
                }}
              />

              {memberOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    backgroundColor: isDark ? '#1a2a3a' : '#FFFFFF',
                    border: `1px solid ${isDark ? `${accentColor}50` : `${accentColor}40`}`,
                    borderRadius: '8px',
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0,0,0,0.5)'
                      : '0 8px 24px rgba(0,0,0,0.12)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  {filteredMembers.length === 0 ? (
                    <div
                      style={{
                        padding: '14px',
                        fontSize: '11px',
                        color: `${textColor}50`,
                        textAlign: 'center',
                        fontFamily: "'OV Soge', sans-serif",
                      }}
                    >
                      No members found
                    </div>
                  ) : (
                    filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setMemberId(m.id);
                          setContributorName('');
                          setMemberQuery('');
                          setMemberOpen(false);
                          setErrors((p) => ({ ...p, member: '' }));
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          backgroundColor: memberId === m.id ? `${accentColor}15` : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                        onMouseEnter={(e) => {
                          if (memberId !== m.id) {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark
                              ? 'rgba(255,255,255,0.06)'
                              : `${textColor}06`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            memberId === m.id ? `${accentColor}15` : 'transparent';
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: memberId === m.id ? accentColor : textColor,
                              fontFamily: "'OV Soge', sans-serif",
                            }}
                          >
                            {m.name}
                          </div>
                          <div
                            style={{
                              fontSize: '10px',
                              color: `${textColor}50`,
                              fontFamily: "'OV Soge', sans-serif",
                            }}
                          >
                            {m.memberId} · {m.phone}
                          </div>
                        </div>
                        {memberId === m.id && (
                          <Check size={13} style={{ color: accentColor, flexShrink: 0 }} />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </Field>

          {memberId ? (
            <Field label="Apply to pledge (optional)" required={false} textColor={textColor}>
              <select
                value={pledgeId}
                onChange={(e) => setPledgeId(e.target.value)}
                disabled={pledgesLoading}
                aria-busy={pledgesLoading}
                style={{
                  ...inputBase(cardBg, textColor, borderColor, false, false, isDark),
                  cursor: pledgesLoading ? 'wait' : 'pointer',
                }}
              >
                <option value="">General giving (not linked to a pledge)</option>
                {pledgeRows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label} · paid {row.amount_fulfilled} / {row.target_amount}
                  </option>
                ))}
              </select>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '11px',
                  color: `${textColor}55`,
                  fontFamily: "'OV Soge', sans-serif",
                }}
              >
                Members create pledges in My Giving. Linking a receipt counts toward their pledge
                until it is fulfilled.
              </p>
            </Field>
          ) : null}

          <Field
            label="Contributor name"
            required={false}
            textColor={textColor}
            error={errors.member}
          >
            <TextInput
              value={contributorName}
              onChange={(v) => {
                setContributorName(v);
                setErrors((p) => ({ ...p, member: '' }));
              }}
              placeholder="Use when the payer is not in the list (visitor, guest, external donor)"
              {...dp}
              error={!!errors.member && !memberId}
            />
            <p
              style={{
                margin: '8px 0 0',
                fontSize: '11px',
                color: `${textColor}55`,
                fontFamily: "'OV Soge', sans-serif",
              }}
            >
              Required only if no member is selected. If you pick a member, this name is ignored for
              the receipt.
            </p>
          </Field>

          {/* ── Amount + Currency — LIVE from dropdownOptions ── */}
          <Field label="Amount" required textColor={textColor} error={errors.amount}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '140px', flexShrink: 0 }}>
                <SearchableDropdown
                  id={`${uid}-currency`}
                  value={currency}
                  onChange={setCurrency}
                  options={currencyOptions}
                  placeholder="Currency"
                  searchable={false}
                  {...dp}
                />
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: `${textColor}75`,
                    fontFamily: "'OV Soge', sans-serif",
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                >
                  {currencySymbol}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = raw.split('.');
                    setAmount(parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : raw);
                    setErrors((p) => ({ ...p, amount: '' }));
                  }}
                  placeholder="0.00"
                  style={{
                    ...inputBase(cardBg, textColor, borderColor, false, !!errors.amount, isDark),
                    paddingLeft: '28px',
                  }}
                />
              </div>
            </div>
          </Field>

          {/* ── Payment Method ── */}
          <Field label="Payment Method" required textColor={textColor}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {[
                { value: 'cash', label: 'Cash', icon: <Banknote size={13} /> },
                { value: 'momo', label: 'Mobile Money', icon: <Smartphone size={13} /> },
                { value: 'bank_transfer', label: 'Bank Transfer', icon: <Building2 size={13} /> },
              ].map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(pm.value);
                    setMomoNetwork('');
                    setMomoTxId('');
                    setMomoName('');
                    setBankTransferType('');
                    setCheckId('');
                    setBankName('');
                    setBankTxId('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: 'clamp(11px, 1.2vw, 12px)',
                    fontFamily: "'OV Soge', sans-serif",
                    fontWeight: 500,
                    border: `1px solid ${paymentMethod === pm.value ? accentColor : borderColor}`,
                    backgroundColor:
                      paymentMethod === pm.value ? `${accentColor}18` : 'transparent',
                    color: paymentMethod === pm.value ? accentColor : `${textColor}80`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {pm.icon} {pm.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'momo' && (
              <div
                style={{
                  paddingLeft: '14px',
                  borderLeft: `3px solid ${accentColor}40`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <Field label="Network" required textColor={textColor} error={errors.momoNetwork}>
                  <SearchableDropdown
                    id={`${uid}-momo-net`}
                    value={momoNetwork}
                    onChange={(v) => {
                      setMomoNetwork(v);
                      setErrors((p) => ({ ...p, momoNetwork: '' }));
                    }}
                    options={MOMO_NETWORKS}
                    placeholder="Select network"
                    searchable={false}
                    icon={<Smartphone size={13} />}
                    {...dp}
                    error={!!errors.momoNetwork}
                  />
                </Field>
                <Field label="Account Name" required textColor={textColor} error={errors.momoName}>
                  <TextInput
                    value={momoName}
                    onChange={(v) => {
                      setMomoName(lettersOnly(v));
                      setErrors((p) => ({ ...p, momoName: '' }));
                    }}
                    placeholder="Name on MoMo account (letters only)"
                    {...dp}
                    error={!!errors.momoName}
                  />
                </Field>
                <Field
                  label="Transaction ID"
                  required
                  textColor={textColor}
                  error={errors.momoTxId}
                >
                  <TextInput
                    value={momoTxId}
                    onChange={(v) => {
                      setMomoTxId(v);
                      setErrors((p) => ({ ...p, momoTxId: '' }));
                    }}
                    placeholder="e.g. GH-MOMO-0000000"
                    {...dp}
                    error={!!errors.momoTxId}
                  />
                </Field>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div
                style={{
                  paddingLeft: '14px',
                  borderLeft: `3px solid ${accentColor}40`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <Field
                  label="Transfer Type"
                  required
                  textColor={textColor}
                  error={errors.bankTransferType}
                >
                  <SearchableDropdown
                    id={`${uid}-bank-type`}
                    value={bankTransferType}
                    onChange={(v) => {
                      setBankTransferType(v);
                      setErrors((p) => ({ ...p, bankTransferType: '' }));
                    }}
                    options={BANK_TRANSFER_TYPES}
                    placeholder="Select type"
                    searchable={false}
                    icon={<CreditCard size={13} />}
                    {...dp}
                    error={!!errors.bankTransferType}
                  />
                </Field>
                <Field label="Bank Name" required textColor={textColor} error={errors.bankName}>
                  <TextInput
                    value={bankName}
                    onChange={(v) => {
                      setBankName(lettersOnly(v));
                      setErrors((p) => ({ ...p, bankName: '' }));
                    }}
                    placeholder="e.g. GCB Bank (letters only)"
                    {...dp}
                    error={!!errors.bankName}
                  />
                </Field>
                {bankTransferType === 'cashier_check' && (
                  <Field label="Check ID" required textColor={textColor} error={errors.checkId}>
                    <TextInput
                      value={checkId}
                      onChange={(v) => {
                        setCheckId(v);
                        setErrors((p) => ({ ...p, checkId: '' }));
                      }}
                      placeholder="e.g. CHK-00123"
                      {...dp}
                      error={!!errors.checkId}
                    />
                  </Field>
                )}
                {bankTransferType === 'bank_system' && (
                  <Field
                    label="Transaction ID"
                    required
                    textColor={textColor}
                    error={errors.bankTxId}
                  >
                    <TextInput
                      value={bankTxId}
                      onChange={(v) => {
                        setBankTxId(v);
                        setErrors((p) => ({ ...p, bankTxId: '' }));
                      }}
                      placeholder="e.g. TXN-9876543"
                      {...dp}
                      error={!!errors.bankTxId}
                    />
                  </Field>
                )}
              </div>
            )}
          </Field>

          {/* ── Notification ── */}
          <Field label="Notify Member Via" textColor={textColor}>
            <NotificationPicker
              value={notification}
              onChange={setNotification}
              textColor={textColor}
              accentColor={accentColor}
              borderColor={borderColor}
            />
          </Field>

          {/* ── Actions ── */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${borderColor}`,
              marginTop: '4px',
            }}
          >
            <button
              type="button"
              onClick={handleCancelClick}
              style={{
                width: '110px',
                flexShrink: 0,
                height: '48px',
                borderRadius: '10px',
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : `${textColor}09`,
                color: `${textColor}75`,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={disabled || isSubmitting}
              title="Save to the server without opening the receipt"
              onClick={() => void handleSave(false)}
              style={{
                flex: '1 1 140px',
                minWidth: '120px',
                height: '48px',
                borderRadius: '10px',
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                color: textColor,
                border: `1px solid ${borderColor}`,
                cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
                opacity: disabled || isSubmitting ? 0.65 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                letterSpacing: '0.01em',
              }}
            >
              <Save size={16} strokeWidth={2.25} />
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              disabled={disabled || isSubmitting}
              title="Save and open the receipt for printing"
              onClick={() => void handleSave(true)}
              style={{
                flex: '1 1 160px',
                minWidth: '140px',
                height: '48px',
                borderRadius: '10px',
                fontFamily: "'OV Soge', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                backgroundColor: accentColor,
                color: '#FFFFFF',
                border: 'none',
                cursor: disabled || isSubmitting ? 'not-allowed' : 'pointer',
                opacity: disabled || isSubmitting ? 0.65 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                letterSpacing: '0.01em',
              }}
            >
              <Printer size={16} strokeWidth={2.25} />
              {isSubmitting ? 'Saving…' : 'Print receipt'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 540px) {
          .ri-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {showCancelConfirm && (
        <CancelConfirmDialog
          onConfirm={() => {
            setShowCancelConfirm(false);
            onCancel();
          }}
          onStay={() => setShowCancelConfirm(false)}
          textColor={textColor}
          cardBg={cardBg}
          borderColor={borderColor}
        />
      )}
    </>
  );
}
