'use client';

/**
 * MembersFilterBar.tsx
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { Search, ChevronDown, Plus, X } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';
import type { MemberStatus, MemberRole } from './membersDummyData';

export interface MembersFilterValues {
  search: string;
  status: MemberStatus | 'All';
  role: string;
}

interface MembersFilterBarProps {
  values:      MembersFilterValues;
  onChange:    (next: MembersFilterValues) => void;
  onAddMember: () => void;
}

const STATUS_OPTIONS: Array<MemberStatus | 'All'> = ['All', 'Active', 'Inactive', 'Pending'];

const ROLE_SUGGESTIONS: Array<MemberRole | 'All'> = [
  'All', 'Admin', 'Core Admin', 'Departmental Head', 'Member',
];

const STROKE = '#D9DADC';
const ADD_BTN_COLOR = '#2FC4B2';

// ── Smart dropdown position ───────────────────────────────────────────────────

function useSmartPosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  panelHeight: number,
) {
  const [openUpward, setOpenUpward] = useState(false);
  useEffect(() => {
    if (!open || !triggerRef.current) { return; }
    const rect = triggerRef.current.getBoundingClientRect();
    setOpenUpward(window.innerHeight - rect.bottom < panelHeight + 8);
  }, [open, triggerRef, panelHeight]);
  return openUpward;
}

// ── StatusDropdown ────────────────────────────────────────────────────────────

function StatusDropdown({
  label, options, value, onChange, isDark, primaryColor, accentColor,
}: {
  label: string;
  options: Array<MemberStatus | 'All'>;
  value: MemberStatus | 'All';
  onChange: (v: MemberStatus | 'All') => void;
  isDark: boolean;
  primaryColor: string;
  accentColor: string;
}) {
  const [open, setOpen]     = useState(false);
  const triggerRef          = useRef<HTMLButtonElement | null>(null);
  const panelRef            = useRef<HTMLDivElement | null>(null);
  const openUpward          = useSmartPosition(triggerRef, open, options.length * 44 + 8);

  useEffect(() => {
    if (!open) { return; }
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) { return; }
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); } };

  const bg        = isDark ? '#1A3F6B22' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF'   : '#000000';
  const panelBg   = isDark ? '#0D1F36'   : '#FFFFFF';

  return (
    <div className="relative flex-shrink-0" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '0 12px',
          background: bg,
          border: `1px solid ${open ? accentColor : STROKE}`,
          borderRadius: '4px',
          minWidth: '130px', height: '39px',
          cursor: 'pointer', outline: 'none',
        }}
      >
        <span style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: '12px',
          color: value === 'All' ? `${textColor}99` : textColor,
          flex: 1, textAlign: 'left', whiteSpace: 'nowrap',
        }}>
          {value === 'All' ? label : value}
        </span>
        <ChevronDown size={14} style={{
          color: `${textColor}70`,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease', flexShrink: 0,
        }} />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="listbox"
          style={{
            position: 'absolute', zIndex: 50,
            background: panelBg,
            border: `1px solid ${STROKE}`,
            borderRadius: '4px',
            minWidth: '180px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            ...(openUpward ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
            left: 0,
          }}
        >
          {options.map(opt => {
            const selected = opt === value;
            return (
              <button
                key={opt}
                role="option"
                aria-selected={selected}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 16px',
                  background: selected ? primaryColor : 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: '12px',
                  color: selected ? '#FFFFFF' : isDark ? '#FFFFFF' : '#000000',
                }}
                onMouseEnter={e => { if (!selected) { (e.currentTarget as HTMLButtonElement).style.background = `${STROKE}55`; } }}
                onMouseLeave={e => { if (!selected) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
              >
                {opt === 'All' ? label : opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── RoleComboBox ──────────────────────────────────────────────────────────────

function RoleComboBox({
  value, onChange, isDark, accentColor, primaryColor,
}: {
  value: string;
  onChange: (v: string) => void;
  isDark: boolean;
  accentColor: string;
  primaryColor: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef<HTMLDivElement | null>(null);
  const inputRef        = useRef<HTMLInputElement | null>(null);

  const textColor = isDark ? '#FFFFFF' : '#000000';
  const bg        = isDark ? '#1A3F6B22' : '#FFFFFF';
  const panelBg   = isDark ? '#0D1F36'   : '#FFFFFF';

  const filtered = ROLE_SUGGESTIONS.filter(s =>
    s === 'All' || !value || value === 'All'
      ? true
      : s.toLowerCase().includes(value.toLowerCase()),
  );

  useEffect(() => {
    if (!open) { return; }
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const displayValue = value === 'All' ? '' : value;

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0, minWidth: '160px' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: bg,
        border: `1px solid ${open ? accentColor : STROKE}`,
        borderRadius: '4px', height: '39px',
        transition: 'border-color 0.15s',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder="All Roles"
          onChange={e => { onChange(e.target.value === '' ? 'All' : e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{
            flex: 1, height: '100%', padding: '0 8px',
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: '12px', fontFamily: "'Poppins', sans-serif",
            color: displayValue ? textColor : `${textColor}70`,
          }}
        />
        <button
          type="button"
          onClick={() => { setOpen(o => !o); inputRef.current?.focus(); }}
          style={{ padding: '0 8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: `${textColor}70` }}
        >
          <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>
      </div>

      {open && (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          zIndex: 50, background: panelBg,
          border: `1px solid ${STROKE}`, borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          maxHeight: '220px', overflowY: 'auto',
        }}>
          {filtered.map(opt => {
            const isSelected = opt === value || (opt === 'All' && (!value || value === 'All'));
            return (
              <button
                key={opt}
                role="option"
                aria-selected={isSelected}
                type="button"
                onMouseDown={() => { onChange(opt); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '9px 14px',
                  fontSize: '12px', fontFamily: "'Poppins', sans-serif",
                  background: isSelected ? primaryColor : 'transparent',
                  color: isSelected ? '#FFFFFF' : textColor,
                  fontWeight: isSelected ? 600 : 400,
                  border: 'none', cursor: 'pointer', display: 'block',
                }}
                onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.background = `${STROKE}55`; } }}
                onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
              >
                {opt === 'All' ? 'All Roles' : opt}
              </button>
            );
          })}
          {displayValue && !ROLE_SUGGESTIONS.some(s => s.toLowerCase() === displayValue.toLowerCase()) && (
            <div style={{ padding: '9px 14px', fontSize: '11px', color: accentColor, fontStyle: 'italic', borderTop: `1px solid ${STROKE}40` }}>
              Searching for &ldquo;{displayValue}&rdquo;…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MembersFilterBar ──────────────────────────────────────────────────────────

export default function MembersFilterBar({ values, onChange, onAddMember }: MembersFilterBarProps) {
  const { profile, isReady } = useDepartmentProfile();
  const { resolvedTheme, mounted } = useDeptTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const primaryColor = isReady ? (isDark ? profile.darkPrimaryColor || '#1A3F6B' : profile.primaryColor || '#0B2A4A') : '#0B2A4A';
  const accentColor  = isReady ? (isDark ? profile.darkAccentColor  || '#2FC4B2' : profile.accentColor  || '#2FC4B2') : '#2FC4B2';

  const cardBg    = isDark ? '#0D1F36' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const inputBg   = isDark ? 'transparent' : '#FFFFFF';

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => { onChange({ ...values, search: e.target.value }); },
    [values, onChange],
  );

  const clearSearch = useCallback(() => { onChange({ ...values, search: '' }); }, [values, onChange]);

  return (
    <div
      className="flex flex-wrap items-center gap-3 p-4 sm:p-3"
      style={{ background: cardBg, border: `1px solid ${STROKE}`, borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Search */}
      <div className="relative flex items-center flex-1" style={{ minWidth: '180px' }}>
        <Search size={15} className="absolute left-3 pointer-events-none" style={{ color: '#D9DADC' }} />
        <input
          type="text"
          value={values.search}
          onChange={handleSearchChange}
          placeholder="Search member........"
          className="w-full pl-9 pr-8 py-2 focus:outline-none"
          style={{
            fontFamily: "'OV Soge', 'Inter', sans-serif", fontWeight: 200,
            fontSize: '13px', color: textColor,
            background: inputBg, border: `1px solid ${STROKE}`,
            borderRadius: '4px', height: '39px',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = accentColor; }}
          onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = STROKE; }}
        />
        {values.search && (
          <button type="button" onClick={clearSearch} className="absolute right-2.5 p-0.5 rounded-full" style={{ color: '#D9DADC' }}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Status */}
      <StatusDropdown
        label="All Status"
        options={STATUS_OPTIONS}
        value={values.status}
        onChange={v => onChange({ ...values, status: v })}
        isDark={isDark}
        primaryColor={primaryColor}
        accentColor={accentColor}
      />

      {/* Role */}
      <RoleComboBox
        value={values.role}
        onChange={v => onChange({ ...values, role: v })}
        isDark={isDark}
        accentColor={accentColor}
        primaryColor={primaryColor}
      />

      <div className="flex-1" />

      {/* Add Member */}
      <button
        type="button"
        onClick={onAddMember}
        className="flex items-center gap-2 px-3 sm:px-5 py-2.5 font-semibold active:scale-95 flex-shrink-0"
        style={{
          background: ADD_BTN_COLOR, borderRadius: '8px', border: 'none',
          color: '#FFFFFF', height: '42px', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(47,196,178,0.30)',
          transition: 'filter 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.92)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
      >
        <div style={{ background: '#FFFFFF', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={14} strokeWidth={3} color={ADD_BTN_COLOR} />
        </div>
        <span className="hidden sm:inline" style={{ fontFamily: "'OV Soge', 'Inter', sans-serif", fontWeight: 600, fontSize: '13px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
          Add Member
        </span>
      </button>
    </div>
  );
}