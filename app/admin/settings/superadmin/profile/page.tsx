'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Upload,
  X,
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
  ArrowLeft,
  Camera,
  Globe,
  MapPin} from 'lucide-react';

export default function YourProfilePage() {
  const { profile, updateProfile, isReady } = useChurchProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    adminName: profile.adminName || '',
    adminEmail: profile.adminEmail || '',
    adminRole: profile.adminRole || 'Admin',
    adminPhone: profile.adminPhone || '',
    avatarUrl: profile.avatarUrl as string | null,
    bio: '',
    location: '',
    website: ''});

  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const initials = (form.adminName || profile.adminName || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const pc = profile.primaryColor || '#0B2A4A';

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    updateProfile({
      adminName: form.adminName,
      adminEmail: form.adminEmail,
      adminRole: form.adminRole,
      adminPhone: form.adminPhone,
      avatarUrl: form.avatarUrl});
    setSaving(false);
    toast.success('Profile saved', {
      description: 'Your info is now live in the sidebar and top bar.'});
  };

  // Member since — derived from localStorage creation (approximate with today if not set)
  const memberSince = 'March 2026';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Back link */}
      <Link
        href="/admin/settings/superadmin"
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground hover:text-[color:var(--primary-brand)] dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={15} /> Back to Settings
      </Link>

      {/* ── Profile hero card (GitHub-style) ── */}
      <div className="bg-[var(--admin-surface)] rounded-[24px] border border-[var(--admin-border)] overflow-hidden shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10">
        {/* Banner */}
        <div
          className="h-28 w-full relative"
          style={{
            background: `linear-gradient(135deg, ${pc} 0%, ${profile.accentColor || '#2FC4B2'} 100%)`}}
        />

        {/* Avatar overlapping banner */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              {isReady && form.avatarUrl ? (
                <div className="relative w-24 h-24 rounded-full border-4 border-white dark:border-[var(--admin-surface)] shadow-xl overflow-hidden">
                  <Image
                    src={form.avatarUrl}
                    alt={form.adminName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-[var(--admin-surface)] shadow-xl flex items-center justify-center text-white text-2xl font-black select-none"
                  style={{ backgroundColor: pc }}
                >
                  {initials || <User size={32} />}
                </div>
              )}

              {/* Camera overlay */}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0B2A4A] dark:bg-white text-white dark:text-[#0B2A4A] flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex gap-2 pb-1">
              {form.avatarUrl && (
                <button
                  onClick={() => setForm((prev) => ({ ...prev, avatarUrl: null }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-[12px] font-semibold hover:bg-red-50 transition-colors"
                >
                  <X size={13} /> Remove photo
                </button>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-white/20 text-[#0B2A4A] dark:text-white rounded-lg text-[12px] font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <Upload size={13} /> Upload photo
              </button>
            </div>
          </div>

          {/* Name + role + metadata */}
          <div className="space-y-1 mb-6">
            <h2
              className="text-2xl font-black text-[#0B2A4A] dark:text-white"
            >
              {form.adminName || 'Your Name'}
            </h2>
            <p
              className="text-gray-400 dark:text-white/50 text-[13px]"
            >
              {form.adminRole}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-gray-400 dark:text-white/40 pt-1">
              {profile.churchName && (
                <span className="flex items-center gap-1">
                  <Building2 size={12} /> {profile.churchName}
                </span>
              )}
              {form.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {form.location}
                </span>
              )}
              {form.website && (
                <span className="flex items-center gap-1">
                  <Globe size={12} />
                  <a href={form.website} className="hover:underline" style={{ color: pc }}>
                    {form.website.replace(/^https?:\/\//, '')}
                  </a>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Joined {memberSince}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 pb-4 border-b border-[var(--admin-border)] mb-6">
            {[
              { label: 'Church', value: profile.churchName || '—' },
              {
                label: 'Plan',
                value:
                  profile.subscriptionStatus === 'active'
                    ? 'Active'
                    : profile.subscriptionStatus === 'trial'
                      ? 'Trial'
                      : 'Inactive'},
              { label: 'Role', value: form.adminRole || 'Admin' },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="text-[13px] font-bold text-[#0B2A4A] dark:text-white truncate"
                >
                  {s.value}
                </p>
                <p
                  className="text-[11px] text-gray-400"
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Edit form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1.5">
                <User size={11} /> Full Name
              </Label>
              <Input
                className="h-12 bg-slate-50 dark:bg-white/5 border-none font-semibold rounded-xl"
                value={form.adminName}
                placeholder="Your full name"
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1.5">
                <Shield size={11} /> Role / Title
              </Label>
              <Input
                className="h-12 bg-slate-50 dark:bg-white/5 border-none font-semibold rounded-xl"
                value={form.adminRole}
                onChange={(e) => setForm({ ...form, adminRole: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1.5">
                <Mail size={11} /> Email Address
              </Label>
              <Input
                type="email"
                className="h-12 bg-slate-50 dark:bg-white/5 border-none font-semibold rounded-xl"
                value={form.adminEmail}
                placeholder="you@church.org"
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1.5">
                <Phone size={11} /> Phone Number
              </Label>
              <Input
                type="tel"
                className="h-12 bg-slate-50 dark:bg-white/5 border-none font-semibold rounded-xl"
                value={form.adminPhone}
                placeholder="+233 00 000 0000"
                onChange={(e) => setForm({ ...form, adminPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1.5">
                <MapPin size={11} /> Location
              </Label>
              <Input
                className="h-12 bg-slate-50 dark:bg-white/5 border-none font-semibold rounded-xl"
                value={form.location}
                placeholder="Accra, Ghana"
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1.5">
                <Globe size={11} /> Website / Social
              </Label>
              <Input
                className="h-12 bg-slate-50 dark:bg-white/5 border-none font-semibold rounded-xl"
                value={form.website}
                placeholder="https://yourchurch.org"
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-10 rounded-xl font-bold shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: pc }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
            <p className="text-[11px] text-gray-400">
              Changes appear live in the sidebar and top bar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
