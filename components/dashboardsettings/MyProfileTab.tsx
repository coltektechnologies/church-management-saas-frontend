'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useChurch } from '@/components/quicksetup/contexts/ChurchContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const ChurchProfileTab = () => {
  const { church, setChurch } = useChurch();

  const [form, setForm] = useState({
    churchName: church.churchName || '',
    logoUrl: church.logoUrl || '',
    primaryColor: church.primaryColor || '#0B2A4A',
    accentColor: church.accentColor || '#2FC4B2',
    mission: church.mission || '',
    website: church.website || '',
  });

  const handleSave = () => {
    setChurch(form);
    toast.success('Church profile updated successfully');
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-8 space-y-8 max-w-3xl">
      <h3 className="text-lg font-black text-[#0B2A4A]">Church Profile</h3>

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase text-slate-400">Brand Identity</Label>
        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden relative">
            {form.logoUrl ? (
              <Image src={form.logoUrl} alt="Church Logo" fill className="object-contain" />
            ) : (
              <Upload className="text-slate-300" size={24} />
            )}
          </div>
          <label className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 transition-all">
            Upload Logo
            <input type="file" className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">Official Name</Label>
          <Input
            className="h-12 bg-slate-50 border-none font-bold rounded-xl"
            value={form.churchName}
            onChange={(e) => setForm({ ...form, churchName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">Website</Label>
          <Input
            className="h-12 bg-slate-50 border-none font-bold rounded-xl"
            value={form.website}
            placeholder="e.g. https://mychurch.org"
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400">
            Mission Statement
          </Label>
          <Textarea
            className="bg-slate-50 border-none font-bold rounded-xl resize-none"
            rows={3}
            value={form.mission}
            placeholder="What is your church's mission?"
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="bg-[#0B2A4A] h-12 px-8 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20"
      >
        Update Profile
      </Button>
    </div>
  );
};

export default ChurchProfileTab;
