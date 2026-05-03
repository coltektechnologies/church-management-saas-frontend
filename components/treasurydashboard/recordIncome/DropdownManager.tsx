'use client';

/**
 * DropdownManager.tsx
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Settings2,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import {
  getAllOptionsIncludingHidden,
  addOption,
  editOption,
  removeOption,
  restoreOption,
  DEFAULT_OPTIONS,
  type DropdownKey,
  type DropdownOption,
} from './dropdownOptions';

// ── Props ─────────────────────────────────────────────────────────────────────
interface DropdownManagerProps {
  actor?: string;
  textColor?: string;
  accentColor?: string;
  cardBg?: string;
  borderColor?: string;
  primaryColor?: string;
  isDark?: boolean;
}

// ── Dropdown sections metadata ────────────────────────────────────────────────
const SECTIONS: { key: DropdownKey; label: string; description: string }[] = [
  {
    key: 'income_types',
    label: 'Income Types',
    description: 'Types of income that appear in the "Income Type" field.',
  },
  {
    key: 'currencies',
    label: 'Currencies',
    description: 'Available currencies in the amount field.',
  },
];

// ── Option row ────────────────────────────────────────────────────────────────
function OptionRow({
  option,
  onEdit,
  onRemove,
  onRestore,
  textColor,
  accentColor,
  borderColor,
  isDragging,
  dragHandleProps,
}: {
  option: DropdownOption;
  onEdit: (value: string, newLabel: string) => void;
  onRemove: (value: string) => void;
  onRestore: (value: string) => void;
  textColor: string;
  accentColor: string;
  borderColor: string;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(option.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(option.label);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  const commitEdit = () => {
    if (draft.trim() && draft.trim() !== option.label) {
      onEdit(option.value, draft.trim());
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(option.label);
    setEditing(false);
  };

  const rowBg = option.isHidden
    ? 'rgba(220,38,38,0.04)'
    : isDragging
      ? `${accentColor}12`
      : 'transparent';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 10px',
        borderRadius: '8px',
        border: `1px solid ${option.isHidden ? '#FECACA' : borderColor}`,
        backgroundColor: rowBg,
        marginBottom: '6px',
        opacity: option.isHidden ? 0.65 : 1,
        transition: 'all 0.15s',
      }}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        style={{
          cursor: 'grab',
          color: `${textColor}30`,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          ...(option.isHidden ? { pointerEvents: 'none' as const, opacity: 0.3 } : {}),
        }}
      >
        <GripVertical size={14} />
      </div>

      {/* Default / custom badge */}
      <span
        style={{
          fontSize: '9px',
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: '8px',
          backgroundColor: option.isDefault ? `${accentColor}15` : '#F0FDF4',
          color: option.isDefault ? accentColor : '#15803D',
          flexShrink: 0,
          letterSpacing: '0.04em',
          textTransform: 'uppercase' as const,
        }}
      >
        {option.isDefault ? 'default' : 'custom'}
      </span>

      {/* Label / edit input */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitEdit();
              }
              if (e.key === 'Escape') {
                cancelEdit();
              }
            }}
            style={{
              width: '100%',
              fontSize: '12px',
              fontWeight: 600,
              color: textColor,
              backgroundColor: `${accentColor}10`,
              border: `1.5px solid ${accentColor}`,
              borderRadius: '5px',
              padding: '4px 8px',
              outline: 'none',
              caretColor: accentColor,
            }}
          />
        ) : (
          <span
            style={{
              fontWeight: 600,
              fontSize: '12px',
              color: option.isHidden ? `${textColor}50` : textColor,
              textDecoration: option.isHidden ? 'line-through' : 'none',
            }}
          >
            {option.label}
          </span>
        )}
      </div>

      {/* Value slug */}
      <span
        style={{
          fontSize: '10px',
          fontFamily: 'monospace',
          color: `${textColor}40`,
          flexShrink: 0,
          padding: '2px 6px',
          backgroundColor: `${textColor}06`,
          borderRadius: '4px',
        }}
      >
        {option.value}
      </span>

      {/* Actions */}
      {editing ? (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={commitEdit}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${accentColor}18`,
              color: accentColor,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Check size={12} />
          </button>
          <button
            onClick={cancelEdit}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {option.isHidden ? (
            <button
              onClick={() => onRestore(option.value)}
              title="Restore option"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F0FDF4',
                color: '#15803D',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Eye size={12} />
            </button>
          ) : (
            <>
              <button
                onClick={startEdit}
                title="Rename"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${textColor}08`,
                  color: `${textColor}70`,
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${accentColor}18`;
                  (e.currentTarget as HTMLButtonElement).style.color = accentColor;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${textColor}08`;
                  (e.currentTarget as HTMLButtonElement).style.color = `${textColor}70`;
                }}
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => onRemove(option.value)}
                title={option.isDefault ? 'Hide this option' : 'Remove this option'}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${textColor}08`,
                  color: `${textColor}70`,
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FEE2E2';
                  (e.currentTarget as HTMLButtonElement).style.color = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${textColor}08`;
                  (e.currentTarget as HTMLButtonElement).style.color = `${textColor}70`;
                }}
              >
                {option.isDefault ? <EyeOff size={12} /> : <Trash2 size={12} />}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section panel ─────────────────────────────────────────────────────────────
function SectionPanel({
  sectionKey,
  label,
  description,
  actor,
  textColor,
  accentColor,
  cardBg,
  borderColor,
  isDark,
}: {
  sectionKey: DropdownKey;
  label: string;
  description: string;
  actor: string;
  textColor: string;
  accentColor: string;
  cardBg: string;
  borderColor: string;
  isDark: boolean;
}) {
  // Use lazy initialization to set the initial state without triggering an effect render
  const [options, setOptions] = useState<DropdownOption[]>(() =>
    getAllOptionsIncludingHidden(sectionKey)
  );

  const [collapsed, setCollapsed] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [addError, setAddError] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);

  // Wrap reload in useCallback so it can be safely listed as a useEffect dep.
  const reload = useCallback(() => {
    setOptions(getAllOptionsIncludingHidden(sectionKey));
  }, [sectionKey]);

  // Synchronize state only when the sectionKey changes
  useEffect(() => {
    setOptions(getAllOptionsIncludingHidden(sectionKey));
  }, [sectionKey]);

  const visibleCount = options.filter((o) => !o.isHidden).length;
  const hiddenCount = options.filter((o) => o.isHidden).length;
  const customCount = options.filter((o) => !o.isDefault).length;

  const handleAdd = () => {
    const trimmedLabel = newLabel.trim();
    if (!trimmedLabel) {
      setAddError('Please enter a name.');
      return;
    }
    const result = addOption(sectionKey, trimmedLabel, actor);
    if (!result) {
      setAddError('An option with this name already exists.');
      return;
    }
    setNewLabel('');
    setAddError('');
    setAddingNew(false);
    reload();
  };

  const handleEdit = (value: string, newLabelStr: string) => {
    editOption(sectionKey, value, newLabelStr, actor);
    reload();
  };

  const handleRemove = (value: string) => {
    removeOption(sectionKey, value, actor);
    reload();
  };

  const handleRestore = (value: string) => {
    restoreOption(sectionKey, value);
    reload();
  };

  const handleResetToDefault = () => {
    const defaultValues = new Set(DEFAULT_OPTIONS[sectionKey].map((o) => o.value));
    options.forEach((o) => {
      if (o.isHidden && defaultValues.has(o.value)) {
        restoreOption(sectionKey, o.value);
      }
      if (!o.isDefault) {
        removeOption(sectionKey, o.value, actor);
      }
    });
    reload();
  };

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: cardBg,
      }}
    >
      {/* Section header */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderBottom: collapsed ? 'none' : `1px solid ${borderColor}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              color: textColor,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: '10px',
              color: `${textColor}50`,
            }}
          >
            {visibleCount} visible
            {customCount > 0 && ` · ${customCount} custom`}
            {hiddenCount > 0 && ` · ${hiddenCount} hidden`}
          </span>
        </div>
        <div style={{ color: `${textColor}50`, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: `${textColor}40`,
            }}
          >
            {description}
          </span>
          {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
        </div>
      </button>

      {!collapsed && (
        <div style={{ padding: '16px' }}>
          {options.length === 0 ? (
            <p
              style={{
                fontSize: '12px',
                color: `${textColor}50`,
                textAlign: 'center',
                padding: '20px',
              }}
            >
              No options yet — add one below.
            </p>
          ) : (
            <div>
              {options.map((opt) => (
                <OptionRow
                  key={opt.value}
                  option={opt}
                  onEdit={handleEdit}
                  onRemove={handleRemove}
                  onRestore={handleRestore}
                  textColor={textColor}
                  accentColor={accentColor}
                  borderColor={borderColor}
                />
              ))}
            </div>
          )}

          {addingNew ? (
            <div
              style={{
                marginTop: '10px',
                padding: '12px',
                borderRadius: '8px',
                border: `1.5px dashed ${accentColor}60`,
                backgroundColor: `${accentColor}06`,
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: accentColor,
                  marginBottom: '8px',
                }}
              >
                New option for &ldquo;{label}&rdquo;
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  ref={newInputRef}
                  type="text"
                  value={newLabel}
                  onChange={(e) => {
                    setNewLabel(e.target.value);
                    setAddError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAdd();
                    }
                    if (e.key === 'Escape') {
                      setAddingNew(false);
                      setNewLabel('');
                      setAddError('');
                    }
                  }}
                  placeholder={`e.g. Special Offering`}
                  style={{
                    flex: 1,
                    fontSize: '12px',
                    fontWeight: 500,
                    color: textColor,
                    caretColor: accentColor,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${addError ? '#DC2626' : accentColor}60`,
                    borderRadius: '7px',
                    padding: '8px 12px',
                    outline: 'none',
                  }}
                  autoFocus
                />
                <button
                  onClick={handleAdd}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: accentColor,
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setAddingNew(false);
                    setNewLabel('');
                    setAddError('');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <X size={13} />
                </button>
              </div>
              {addError && (
                <p
                  style={{
                    fontSize: '11px',
                    color: '#DC2626',
                    marginTop: '6px',
                  }}
                >
                  {addError}
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setAddingNew(true);
                  setTimeout(() => newInputRef.current?.focus(), 50);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                  border: `1px dashed ${accentColor}50`,
                  cursor: 'pointer',
                }}
              >
                <Plus size={13} /> Add Option
              </button>
              <button
                onClick={handleResetToDefault}
                title="Reset to defaults — removes custom options and restores all hidden defaults"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: `${textColor}08`,
                  color: `${textColor}60`,
                  border: `1px solid ${borderColor}`,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DropdownManager({
  actor = 'Treasurer',
  textColor = '#0B2A4A',
  accentColor = '#2FC4B2',
  cardBg = '#FFFFFF',
  borderColor = '#DFDADA',
  primaryColor = '#0B2A4A',
  isDark = false,
}: DropdownManagerProps) {
  return (
    <div
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: `${primaryColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Settings2 size={16} style={{ color: primaryColor }} />
        </div>
        <div>
          <h3
            style={{
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 600,
              fontSize: '14px',
              color: textColor,
              margin: 0,
            }}
          >
            Manage Dropdown Options
          </h3>
          <p
            style={{
              fontSize: '11px',
              color: `${textColor}60`,
              margin: 0,
            }}
          >
            Add, rename, or hide options from any form dropdown. Changes save instantly.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '10px 12px',
          borderRadius: '8px',
          backgroundColor: `${accentColor}08`,
          border: `1px solid ${accentColor}20`,
          marginBottom: '16px',
        }}
      >
        {[
          { color: accentColor, label: 'Default — built-in option (can be hidden, not deleted)' },
          { color: '#15803D', label: 'Custom — added by you (can be fully removed)' },
          { color: '#DC2626', label: 'Hidden — removed from the form, can be restored' },
        ].map((item) => (
          <span
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '10px',
              color: `${textColor}70`,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: item.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {item.label}
          </span>
        ))}
      </div>

      <div style={{ height: '1px', backgroundColor: borderColor, marginBottom: '16px' }} />

      {/* Section panels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {SECTIONS.map((s) => (
          <SectionPanel
            key={s.key}
            sectionKey={s.key}
            label={s.label}
            description={s.description}
            actor={actor}
            textColor={textColor}
            accentColor={accentColor}
            cardBg={isDark ? `${cardBg}cc` : '#FAFAFA'}
            borderColor={borderColor}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
}
