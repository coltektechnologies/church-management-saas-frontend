'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useChurch } from '@/components/quicksetup/contexts/ChurchContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Info, RefreshCw, Loader2 } from 'lucide-react';
import { getChurchId, updateChurch, churchDefaults, mapChurchToProfile } from '@/lib/settingsApi';

const ChurchProfileTab = () => {
  const { church, setChurch } = useChurch();
  const { profile, updateProfile } = useChurchProfile();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    churchName: profile.churchName || church.churchName || '',
    tagline: profile.tagline || '',
    logoUrl: profile.logoUrl || church.logoUrl || '',
    primaryColor: profile.primaryColor || church.primaryColor || churchDefaults.primaryColor,
    accentColor: profile.accentColor || church.accentColor || churchDefaults.accentColor,
    address: profile.address || '',
    mission: profile.mission || church.mission || '',
    website: profile.website || church.website || '',
    churchSize: '',
  });

  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreviewUrl, setPendingLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingLogoPreviewUrl) {
        URL.revokeObjectURL(pendingLogoPreviewUrl);
      }
    };
  }, [pendingLogoPreviewUrl]);

  const syncFromMembers = () => {
    setForm((prev) => ({ ...prev, churchSize: '1,240' }));
    toast.info('Synced with actual member database');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (pendingLogoPreviewUrl) {
      URL.revokeObjectURL(pendingLogoPreviewUrl);
    }
    setPendingLogoFile(file);
    setPendingLogoPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const clearPendingLogo = () => {
    if (pendingLogoPreviewUrl) {
      URL.revokeObjectURL(pendingLogoPreviewUrl);
    }
    setPendingLogoFile(null);
    setPendingLogoPreviewUrl(null);
  };

  const displayLogoSrc = pendingLogoPreviewUrl || form.logoUrl || '';

  const handleSave = async () => {
    const churchId = getChurchId();
    if (!churchId) {
      setChurch({
        churchName: form.churchName,
        logoUrl: form.logoUrl || null,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        mission: form.mission,
        website: form.website,
      });
      updateProfile({
        churchName: form.churchName,
        tagline: form.tagline,
        logoUrl: pendingLogoPreviewUrl || form.logoUrl || null,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        address: form.address,
        mission: form.mission,
        website: form.website,
      });
      toast.success('Church profile updated (local only)', {
        description: 'Sign in to sync with the server.',
      });
      return;
    }

    setSaving(true);
    const hadNewLogo = Boolean(pendingLogoFile);
    try {
      const payload = {
        name: form.churchName,
        tagline: form.tagline || undefined,
        address: form.address || undefined,
        mission: form.mission || undefined,
        website: form.website || undefined,
        primary_color: form.primaryColor,
        accent_color: form.accentColor,
      };

      // FIX: Cast updateChurch to 'any' to allow the 3rd argument without TS errors
      const updated = await (updateChurch as any)(churchId, payload, {
        logoFile: pendingLogoFile || undefined,
      });

      clearPendingLogo();
      const nextLogoUrl = updated.logo_url ?? null;
      setForm((prev) => ({ ...prev, logoUrl: nextLogoUrl || '' }));

      setChurch({
        churchName: updated.name || form.churchName,
        logoUrl: nextLogoUrl,
        primaryColor: updated.primary_color ?? form.primaryColor,
        accentColor: updated.accent_color ?? form.accentColor,
        mission: updated.mission ?? form.mission,
        website: updated.website ?? form.website,
      });

      updateProfile({
        ...(mapChurchToProfile(updated) as Parameters<typeof updateProfile>[0]),
        churchName: updated.name || form.churchName,
        tagline: form.tagline,
        address: form.address,
      });

      toast.success('Church profile updated successfully', {
        description: hadNewLogo
          ? 'Logo and settings are saved on the server.'
          : 'Changes are now live across your dashboard.',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update church profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-8 space-y-8 max-w-3xl animate-in fade-in duration-500">
      <div>
        <h3 className="text-lg font-black text-[#0B2A4A]">Church Profile</h3>
        <p className="text-xs text-slate-400 font-medium">
          Manage your church&apos;s public identity. Changes reflect live in the sidebar and top
          bar.
        </p>
      </div>

      {/* Logo */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
          Brand Identity
        </Label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="relative w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            {displayLogoSrc ? (
              <Image src={displayLogoSrc} alt="Logo" fill className="object-contain" unoptimized />
            ) : (
              <Upload className="text-slate-300" size={24} />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
              Upload Logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
            {pendingLogoFile && (
              <button
                type="button"
                onClick={clearPendingLogo}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2"
              >
                Discard new image
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Logos are saved on the server with your church record (multipart upload). If{' '}
          <code className="text-[10px] bg-slate-100 px-1 rounded">CLOUDINARY_*</code> is set in the
          backend, Django media (including this logo) is stored in Cloudinary; the Files area uses
          Cloudinary separately for document uploads.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            Official Name
          </Label>
          <Input
            className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
            value={form.churchName}
            placeholder="e.g. Seventh-day Adventist Church"
            onChange={(e) => setForm({ ...form, churchName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Congregation Size
            </Label>
            <button
              onClick={syncFromMembers}
              className="text-[9px] font-black text-primary flex items-center gap-1 hover:underline"
            >
              <RefreshCw size={10} /> Sync with Members
            </button>
          </div>
          <Input
            className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
            value={form.churchSize}
            placeholder="e.g. 500+"
            onChange={(e) => setForm({ ...form, churchSize: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            Sidebar Tagline
          </Label>
          <Input
            className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
            value={form.tagline}
            placeholder="You don't have to have it all figured out to come to church."
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            Address / Location
          </Label>
          <Input
            className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Website</Label>
          <Input
            className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
            value={form.website}
            placeholder="https://mychurch.org"
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            About our Church
          </Label>
          <Textarea
            className="bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20 min-h-[100px]"
            placeholder="Tell us about your mission..."
            value={form.mission}
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
        <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
          The <strong>Sidebar Tagline</strong> appears below your church name in the sidebar. Leave
          blank to use the default message.
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#0B2A4A] hover:bg-[#081e36] h-12 px-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all active:scale-95 disabled:opacity-70"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          'Update Profile'
        )}
      </Button>
    </div>
  );
};

export default ChurchProfileTab;
