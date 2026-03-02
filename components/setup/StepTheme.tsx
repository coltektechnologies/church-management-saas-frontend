'use client';

import { Check, Palette } from 'lucide-react';
import ColorPicker from './ColorPicker';

export const THEME_PALETTES = [
  { name: 'Default Teal', primary: '#2FC4B2', accent: '#0B2A4A' },
  { name: 'Royal Blue', primary: '#3B82F6', accent: '#1E3A5F' },
  { name: 'Warm Gold', primary: '#F59E0B', accent: '#78350F' },
  { name: 'Rose', primary: '#F43F5E', accent: '#4C0519' },
  { name: 'Violet', primary: '#8B5CF6', accent: '#2E1065' },
  { name: 'Emerald', primary: '#10B981', accent: '#064E3B' },
];

interface StepThemeProps {
  selected: number;
  onSelect: (i: number) => void;
  primaryColor: string;
  accentColor: string;
  onPrimaryChange: (hex: string) => void;
  onAccentChange: (hex: string) => void;
}

const StepTheme = ({
  selected,
  onSelect,
  primaryColor,
  accentColor,
  onPrimaryChange,
  onAccentChange,
}: StepThemeProps) => (
  <div className="animate-in fade-in duration-500">
    <div className="flex items-center gap-2 mb-1">
      <Palette size={16} className="text-[#2FC4B2]" />
      <label className="text-sm font-bold text-[#0B2A4A] block">Branding & Themes</label>
    </div>
    <p className="text-xs text-muted-foreground mb-5">
      Pick a preset or set custom colors for your workspace.
    </p>

    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
      {THEME_PALETTES.map((palette, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`relative rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${
            selected === i
              ? 'border-[#2FC4B2] bg-[#2FC4B2]/5 shadow-sm ring-1 ring-[#2FC4B2]'
              : 'border-border hover:border-[#2FC4B2]/40 bg-white'
          }`}
        >
          <div className="flex -space-x-2">
            <span
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: palette.primary }}
            />
            <span
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: palette.accent }}
            />
          </div>
          <span className="text-[10px] font-bold text-[#0B2A4A] truncate w-full text-center uppercase tracking-tight">
            {palette.name}
          </span>
          {selected === i && (
            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#2FC4B2] flex items-center justify-center">
              <Check size={10} className="text-white stroke-[3px]" />
            </div>
          )}
        </button>
      ))}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/10 p-4 rounded-2xl border border-border">
      <ColorPicker label="Primary Color" value={primaryColor} onChange={onPrimaryChange} />
      <ColorPicker label="Accent Color" value={accentColor} onChange={onAccentChange} />
    </div>

    <div className="mt-6 flex flex-col gap-2">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        Gradient Preview
      </span>
      <div
        className="w-full h-12 rounded-xl shadow-inner border border-white/20 transition-all duration-700"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
      />
    </div>
  </div>
);

export default StepTheme;
