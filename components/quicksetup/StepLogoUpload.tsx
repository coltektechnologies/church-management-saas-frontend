'use client';

import { Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface StepLogoProps {
  logoPreview: string | null;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  churchName: string;
  onChurchNameChange: (val: string) => void;
}

const StepLogoUpload = ({
  logoPreview,
  onLogoChange,
  onClear,
  churchName,
  onChurchNameChange,
}: StepLogoProps) => (
  <div className="animate-in fade-in duration-500">
    <label className="text-sm font-bold text-[#0B2A4A] mb-1.5 block">Church Name*</label>
    <input
      type="text"
      value={churchName}
      onChange={(e) => onChurchNameChange(e.target.value)}
      placeholder="Enter your church name"
      className="form-input-od mb-6"
    />

    <label className="text-sm font-bold text-[#0B2A4A] mb-3 block">Church Logo</label>
    {logoPreview ? (
      <div className="relative border border-border rounded-2xl p-8 flex flex-col items-center gap-4 bg-muted/5">
        <div className="relative w-28 h-28">
          <Image
            src={logoPreview}
            alt="Church logo preview"
            fill
            className="object-contain rounded-lg"
          />
        </div>
        <button
          onClick={onClear}
          className="text-xs text-destructive font-semibold flex items-center gap-1.5 hover:underline transition-all"
        >
          <Trash2 size={14} /> Remove Logo
        </button>
      </div>
    ) : (
      <label className="border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#2FC4B2]/50 hover:bg-[#2FC4B2]/5 transition-all group">
        <div className="w-14 h-14 rounded-full bg-[#2FC4B2]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload size={28} className="text-[#2FC4B2]" />
        </div>
        <div className="text-center">
          <span className="text-sm text-[#0B2A4A] font-bold block">Upload / Drag & Drop</span>
          <span className="text-[11px] text-muted-foreground">PNG, JPG or SVG (max 2 MB)</span>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
      </label>
    )}
  </div>
);

export default StepLogoUpload;
