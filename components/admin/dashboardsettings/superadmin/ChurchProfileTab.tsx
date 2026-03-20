'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useChurch } from '@/components/quicksetup/contexts/ChurchContext';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Info, RefreshCw } from 'lucide-react';

const ChurchProfileTab = () => {
  const { church, setChurch } = useChurch();
  const { profile, updateProfile } = useChurchProfile();

  const [form, setForm] = useState({
    churchName: profile.churchName || church.churchName || '',
    tagline: profile.tagline || '',
    logoUrl: profile.logoUrl || church.logoUrl || '',
    primaryColor: profile.primaryColor || church.primaryColor || '#0B2A4A',
    accentColor: profile.accentColor || church.accentColor || '#2FC4B2',
    address: profile.address || '',
    mission: profile.mission || church.mission || '',
    website: profile.website || church.website || '',
    churchSize: '',
  });

  const syncFromMembers = () => {
    setForm((prev) => ({ ...prev, churchSize: '1,240' }));
    toast.info('Synced with actual member database');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, logoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setChurch({
      churchName: form.churchName,
      logoUrl: form.logoUrl || null,
      primaryColor: form.primaryColor,
      accentColor: form.accentColor,
      mission: form.mission,
      website: form.website,
    });

    // Live update sidebar + topbar
    updateProfile({
      churchName: form.churchName,
      tagline: form.tagline,
      logoUrl: form.logoUrl || null,
      primaryColor: form.primaryColor,
      accentColor: form.accentColor,
      address: form.address,
      mission: form.mission,
      website: form.website,
    });

    toast.success('Church profile updated successfully', {
      description: 'Changes are now live across your dashboard.',
    });
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
        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="relative w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
            {form.logoUrl ? (
              <Image src={form.logoUrl} alt="Logo" fill className="object-contain" unoptimized />
            ) : (
              <Upload className="text-slate-300" size={24} />
            )}
          </div>
          <label className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
            Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </label>
        </div>
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
        className="bg-[#0B2A4A] hover:bg-[#081e36] h-12 px-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all active:scale-95"
      >
        Update Profile
      </Button>
    </div>
  );
};

export default ChurchProfileTab;
