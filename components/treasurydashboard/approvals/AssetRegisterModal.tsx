'use client';

// /components/treasurydashboard/approvals/AssetRegisterModal.tsx

import { useState, useEffect } from 'react';
import { X, Package, Plus, CheckCircle, ChevronRight } from 'lucide-react';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { DUMMY_ASSETS, type Asset } from './approvalsData';

function autoText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.179 ? '#0B2A4A' : '#FFFFFF';
}

type Props = {
  action: () => Promise<void>;
};

const STORAGE_KEY = 'church_treasury_assets';

const CATEGORIES = [
  'Audio Equipment',
  'Audio/Visual',
  'Vehicles',
  'Furniture',
  'Electronics',
  'Musical Instruments',
  'Office Equipment',
  'Buildings',
  'Land',
  'Other',
];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;

const EMPTY_FORM = {
  name: '',
  category: '',
  purchaseDate: '',
  value: '',
  location: '',
  description: '',
  condition: 'Good' as Asset['condition'],
};

function loadAssets(): Asset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Asset[];
    }
  } catch {}
  return DUMMY_ASSETS;
}

function saveAssets(assets: Asset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch {}
}

const conditionColor: Record<string, string> = {
  Excellent: '#2BAF2E',
  Good: '#2FC4B2',
  Fair: '#F59E0B',
  Poor: '#FA5C5C',
};

export default function AssetRegisterModal({ action }: Props) {
  const { profile, isReady } = useTreasuryProfile();
  const isDark = isReady ? profile.darkMode : false;

  const primaryColor = isDark
    ? profile.darkPrimaryColor || '#1A3F6B'
    : profile.primaryColor || '#0B2A4A';
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';
  const sidebarColor = isDark
    ? profile.darkSidebarColor || '#0D1F36'
    : profile.sidebarColor || '#FFFFFF';

  const textOnPrimary = autoText(primaryColor);
  const borderCol = isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB';
  const mutedText = isDark ? 'rgba(255,255,255,0.5)' : '#6B7280';
  const bodyText = isDark ? 'rgba(255,255,255,0.9)' : '#1F2937';
  // Inputs: light mode uses white bg, dark uses slightly lighter panel
  const inputBg = isDark ? `rgba(255,255,255,0.07)` : '#F9FAFB';
  const inputBorderCol = isDark ? 'rgba(255,255,255,0.12)' : '#D1D5DB';

  const [assets, setAssets] = useState<Asset[]>(() => loadAssets());
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState<'list' | 'add'>('list');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load persisted assets on mount

  const handleChange = (k: keyof typeof EMPTY_FORM, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) {
      setErrors((e) => ({ ...e, [k]: '' }));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) {
      e.name = 'Asset name is required';
    }
    if (!form.category) {
      e.category = 'Category is required';
    }
    if (!form.value || isNaN(parseFloat(form.value))) {
      e.value = 'Valid value is required';
    }
    return e;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const newAsset: Asset = {
      id: `ASSET-${String(assets.length + 1).padStart(3, '0')}`,
      name: form.name.trim(),
      category: form.category,
      purchaseDate: form.purchaseDate || 'N/A',
      value: parseFloat(form.value),
      currency: 'GHS',
      condition: form.condition,
      location: form.location.trim() || 'N/A',
      description: form.description.trim(),
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    saveAssets(updated); // persist to localStorage

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm(EMPTY_FORM);
      setView('list');
    }, 1600);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: inputBg,
    border: `1px solid ${inputBorderCol}`,
    color: bodyText,
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    color: mutedText,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'block',
    marginBottom: '5px',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && action()}
    >
      <div
        className="w-full sm:w-[640px] flex flex-col overflow-hidden"
        style={{
          backgroundColor: sidebarColor,
          border: `1px solid ${borderCol}`,
          borderRadius: '10px 10px 0 0',
          maxHeight: '92vh',
          // On sm+ screens, full rounded
          ...(typeof window !== 'undefined' && window.innerWidth >= 640
            ? { borderRadius: '10px', maxHeight: '88vh' }
            : {}),
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${borderCol}`, backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}25` }}
            >
              <Package size={17} style={{ color: accentColor }} />
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: `${textOnPrimary}55` }}
              >
                Church Property
              </p>
              <p className="text-sm font-black" style={{ color: textOnPrimary }}>
                Asset Register
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === 'list' ? 'add' : 'list')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all hover:opacity-80"
              style={{
                backgroundColor: accentColor,
                color: autoText(accentColor),
                borderRadius: '8px',
              }}
            >
              {view === 'list' ? (
                <>
                  <Plus size={12} /> New Asset
                </>
              ) : (
                <>
                  <ChevronRight size={12} /> View All
                </>
              )}
            </button>
            <button
              onClick={action}
              className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-70"
              style={{
                backgroundColor: `${textOnPrimary}15`,
                color: textOnPrimary,
                borderRadius: '8px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5">
          {view === 'list' ? (
            <div className="space-y-2.5">
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: mutedText }}
              >
                {assets.length} Registered Asset{assets.length !== 1 ? 's' : ''}
              </p>
              {assets.length === 0 && (
                <div className="py-10 flex flex-col items-center gap-2">
                  <Package size={28} style={{ color: mutedText, opacity: 0.4 }} />
                  <p className="text-sm" style={{ color: mutedText }}>
                    No assets registered yet.
                  </p>
                </div>
              )}
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between gap-3 p-3.5"
                  style={{
                    backgroundColor: isDark ? `${primaryColor}22` : '#F9FAFB',
                    border: `1px solid ${borderCol}`,
                    borderRadius: '10px',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${accentColor}20`, borderRadius: '10px' }}
                    >
                      <Package size={15} style={{ color: accentColor }} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-xs sm:text-sm font-bold truncate"
                        style={{ color: bodyText }}
                      >
                        {asset.name}
                      </p>
                      <p className="text-[10px] sm:text-xs" style={{ color: mutedText }}>
                        {asset.category} · {asset.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-black" style={{ color: bodyText }}>
                      {asset.currency} {asset.value.toLocaleString()}
                    </p>
                    <span
                      className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${conditionColor[asset.condition]}20`,
                        color: conditionColor[asset.condition],
                      }}
                    >
                      {asset.condition}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-black" style={{ color: bodyText }}>
                Register New Asset
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Name */}
                <div>
                  <label style={labelStyle}>Asset Name *</label>
                  <input
                    style={{ ...inputStyle, borderColor: errors.name ? '#FA5C5C' : inputBorderCol }}
                    placeholder="e.g. Projector Screen"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-[10px] mt-1" style={{ color: '#FA5C5C' }}>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    style={{
                      ...inputStyle,
                      borderColor: errors.category ? '#FA5C5C' : inputBorderCol,
                    }}
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-[10px] mt-1" style={{ color: '#FA5C5C' }}>
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Purchase Date */}
                <div>
                  <label style={labelStyle}>Purchase Date</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={form.purchaseDate}
                    onChange={(e) => handleChange('purchaseDate', e.target.value)}
                  />
                </div>

                {/* Value */}
                <div>
                  <label style={labelStyle}>Value (GHS) *</label>
                  <input
                    type="number"
                    style={{
                      ...inputStyle,
                      borderColor: errors.value ? '#FA5C5C' : inputBorderCol,
                    }}
                    placeholder="0.00"
                    value={form.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                  />
                  {errors.value && (
                    <p className="text-[10px] mt-1" style={{ color: '#FA5C5C' }}>
                      {errors.value}
                    </p>
                  )}
                </div>

                {/* Condition */}
                <div>
                  <label style={labelStyle}>Condition</label>
                  <select
                    style={inputStyle}
                    value={form.condition}
                    onChange={(e) =>
                      handleChange('condition', e.target.value as Asset['condition'])
                    }
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label style={labelStyle}>Location</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Main Sanctuary"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label style={labelStyle}>Description</label>
                  <textarea
                    rows={3}
                    style={{ ...inputStyle, resize: 'none' }}
                    placeholder="Brief description of the asset..."
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99]"
                style={{
                  backgroundColor: submitted ? '#2BAF2E' : '#2C5F2D',
                  color: '#fff',
                  borderRadius: '10px',
                }}
              >
                {submitted ? (
                  <>
                    <CheckCircle size={16} /> Asset Registered Successfully!
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Register Asset
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
