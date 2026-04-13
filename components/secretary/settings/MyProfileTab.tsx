'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useSecretaryProfile } from '@/components/secretary/contexts/SecretaryProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, X, User, Info } from 'lucide-react';

export default function MyProfileTab() {
  const { profile, updateProfile } = useSecretaryProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    adminName: profile.adminName || '',
    preferredName: profile.preferredName || '',
    adminEmail: profile.adminEmail || '',
    adminRole: profile.adminRole || '',
    adminPhone: profile.adminPhone || '',
    avatarUrl: profile.avatarUrl || (null as string | null),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const initials = form.adminName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // What the topbar trigger will show — preferred name if set, else last word of full name
  const topbarPreview =
    form.preferredName.trim() || form.adminName.split(' ').filter(Boolean).slice(-1)[0] || 'You';

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
      <div>
        <h3 className="text-lg font-black text-foreground">My Profile</h3>
        <p className="text-xs text-muted-foreground font-medium">
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
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl shadow"
              style={{ backgroundColor: profile.primaryColor || '#0B2A4A' }}
            >
              {initials || <User size={28} />}
            </div>
          )}
        </div>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted/30 transition-all flex items-center gap-2"
          >
            <Upload size={14} /> Upload Photo
          </button>
          <p className="text-[10px] text-muted-foreground mt-1.5">PNG or JPG, max 2MB</p>
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
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Full Name
          </Label>
          <Input
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.adminName}
            placeholder="e.g. John Doe"
            onChange={(e) => setForm({ ...form, adminName: e.target.value })}
          />
          <p className="text-[10px] text-muted-foreground ml-1">Shown in full on the sidebar.</p>
        </div>

        {/* Preferred / display name */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Preferred Name
            <span className="ml-1 normal-case font-normal text-muted-foreground">
              (topbar &amp; profile)
            </span>
          </Label>
          <Input
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.preferredName}
            placeholder="e.g. John"
            onChange={(e) => setForm({ ...form, preferredName: e.target.value })}
          />
          {/* Live preview of what the topbar will show */}
          <div className="flex items-center gap-1.5 ml-1">
            <Info size={10} className="text-muted-foreground flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              Topbar will show: <span className="font-bold text-foreground">{topbarPreview}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Role / Title
          </Label>
          <Input
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.adminRole}
            placeholder="Secretary / Pastor"
            onChange={(e) => setForm({ ...form, adminRole: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Email Address
          </Label>
          <Input
            type="email"
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.adminEmail}
            onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Phone Number
          </Label>
          <Input
            type="tel"
            className="h-12 bg-muted/20 border-none font-bold rounded-xl"
            value={form.adminPhone}
            onChange={(e) => setForm({ ...form, adminPhone: e.target.value })}
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="h-12 px-12 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        style={{ backgroundColor: profile.primaryColor || '#0B2A4A', color: '#ffffff' }}
      >
        Save Profile
      </Button>
    </div>
  );
}
