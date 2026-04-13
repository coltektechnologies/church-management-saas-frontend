'use client';

import { useState, useRef, useEffect, startTransition } from 'react';
import Image from 'next/image';
import { useTreasuryProfile } from '@/components/treasurydashboard/contexts/TreasuryProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, X, User, Info } from 'lucide-react';

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

export default function MyProfileTab() {
  const { profile, updateProfile } = useTreasuryProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const seededRef = useRef(false);

  const [form, setForm] = useState({
    adminName: '',
    preferredName: '',
    adminEmail: '',
    adminRole: '',
    adminPhone: '',
    avatarUrl: null as string | null,
  });

  // ── Seed form from profile once, ────
  useEffect(() => {
    if (seededRef.current) {
      return;
    }
    seededRef.current = true;
    startTransition(() => {
      setForm({
        adminName: profile.adminName || '',
        preferredName: profile.preferredName || '',
        adminEmail: profile.adminEmail || '',
        adminRole: profile.adminRole || '',
        adminPhone: profile.adminPhone || '',
        avatarUrl: profile.avatarUrl || null,
      });
    });
  }, [
    profile.adminName,
    profile.preferredName,
    profile.adminEmail,
    profile.adminRole,
    profile.adminPhone,
    profile.avatarUrl,
  ]);

  // ── Derive colours from profile directly — no DOM reads, no flicker ────────
  const isDark = profile.darkMode ?? false;

  const cardBg = isDark
    ? profile.darkBackgroundColor || '#0A1628'
    : profile.backgroundColor || '#F5F7FA';

  const textColor = autoText(cardBg);

  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const inputStyle: React.CSSProperties = {
    backgroundColor: inputBg,
    color: textColor,
    caretColor: textColor,
    border: `1px solid ${textColor}20`,
  };

  const avatarBg = isDark
    ? profile.darkPrimaryColor || '#1A3F6B'
    : profile.primaryColor || '#0B2A4A';

  const saveBg = isDark ? profile.darkPrimaryColor || '#1A3F6B' : profile.primaryColor || '#0B2A4A';

  // ── Derived display values ────────────────────────────────────────────────
  const initials = form.adminName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const topbarPreview =
    form.preferredName.trim() || form.adminName.split(' ').filter(Boolean).slice(-1)[0] || 'You';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({
      adminName: form.adminName,
      preferredName: form.preferredName,
      adminEmail: form.adminEmail,
      adminRole: form.adminRole,
      adminPhone: form.adminPhone,
      avatarUrl: form.avatarUrl,
    });
    toast.success('Profile updated successfully', {
      description: 'Your name and photo are now live across the sidebar and topbar.',
    });
  };

  return (
    <div className="bg-card rounded-[24px] border border-border p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h3 className="text-lg font-black" style={{ color: textColor }}>
          My Profile
        </h3>
        <p className="text-xs font-medium" style={{ color: `${textColor}99` }}>
          Your personal info — shown in the sidebar and top navigation.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {form.avatarUrl ? (
            <div className="relative w-20 h-20">
              <Image
                src={form.avatarUrl}
                alt={form.adminName}
                fill
                className="rounded-full object-cover border-2 border-border shadow"
                unoptimized
              />
              <button
                onClick={() => setForm((prev) => ({ ...prev, avatarUrl: null }))}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow hover:opacity-90"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl shadow"
              style={{ backgroundColor: avatarBg, color: autoText(avatarBg) }}
            >
              {initials || <User size={28} />}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-xl text-xs font-bold hover:opacity-75 transition-all flex items-center gap-2"
            style={{ border: `1px solid ${textColor}30`, color: textColor }}
          >
            <Upload size={14} /> Upload Photo
          </button>
          <p className="text-[10px] mt-1.5" style={{ color: `${textColor}70` }}>
            PNG or JPG, max 2MB
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            className="text-[10px] font-black uppercase ml-1"
            style={{ color: `${textColor}99` }}
          >
            Full Name
          </Label>
          <Input
            className="h-12 rounded-xl font-bold border-0 focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:opacity-40"
            style={inputStyle}
            value={form.adminName}
            placeholder="e.g. John Doe"
            onChange={(e) => setForm({ ...form, adminName: e.target.value })}
          />
          <p className="text-[10px] ml-1" style={{ color: `${textColor}70` }}>
            Shown in full on the sidebar.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            className="text-[10px] font-black uppercase ml-1"
            style={{ color: `${textColor}99` }}
          >
            Preferred Name{' '}
            <span className="ml-1 normal-case font-normal" style={{ color: `${textColor}70` }}>
              (topbar &amp; profile)
            </span>
          </Label>
          <Input
            className="h-12 rounded-xl font-bold border-0 focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:opacity-40"
            style={inputStyle}
            value={form.preferredName}
            placeholder="e.g. John"
            onChange={(e) => setForm({ ...form, preferredName: e.target.value })}
          />
          <div className="flex items-center gap-1.5 ml-1">
            <Info size={10} style={{ color: `${textColor}70`, flexShrink: 0 }} />
            <p className="text-[10px]" style={{ color: `${textColor}70` }}>
              Topbar will show:{' '}
              <span className="font-bold" style={{ color: textColor }}>
                {topbarPreview}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            className="text-[10px] font-black uppercase ml-1"
            style={{ color: `${textColor}99` }}
          >
            Role / Title
          </Label>
          <Input
            className="h-12 rounded-xl font-bold border-0 focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:opacity-40"
            style={inputStyle}
            value={form.adminRole}
            placeholder="Treasurer"
            onChange={(e) => setForm({ ...form, adminRole: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label
            className="text-[10px] font-black uppercase ml-1"
            style={{ color: `${textColor}99` }}
          >
            Email Address
          </Label>
          <Input
            type="email"
            className="h-12 rounded-xl font-bold border-0 focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:opacity-40"
            style={inputStyle}
            value={form.adminEmail}
            onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label
            className="text-[10px] font-black uppercase ml-1"
            style={{ color: `${textColor}99` }}
          >
            Phone Number
          </Label>
          <Input
            type="tel"
            className="h-12 rounded-xl font-bold border-0 focus-visible:ring-1 focus-visible:ring-offset-0 placeholder:opacity-40"
            style={inputStyle}
            value={form.adminPhone}
            onChange={(e) => setForm({ ...form, adminPhone: e.target.value })}
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="h-12 px-12 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        style={{ backgroundColor: saveBg, color: autoText(saveBg) }}
      >
        Save Profile
      </Button>
    </div>
  );
}
