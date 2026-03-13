'use client';

import { useState, useEffect } from 'react';
import { useChurch } from '@/components/quicksetup/contexts/ChurchContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Info, RefreshCw } from 'lucide-react';

const ChurchProfileTab = () => {
  const { church, setChurch } = useChurch();

  // Cast to any to access dynamic properties without TS errors
  const churchData = church as any;

  // We initialize the form with whatever is currently in the Context.
  // This could be from Step 1 of Quick Setup or a previously saved state.
  const [form, setForm] = useState({
    churchName: churchData?.churchName || '',
    churchSize: churchData?.churchSize || '',
    logoUrl: churchData?.logoUrl || '',
    primaryColor: churchData?.primaryColor || '#0B2A4A',
    accentColor: churchData?.accentColor || '#2FC4B2',
    address: churchData?.address || '',
    description: churchData?.description || '',
  });

  // Logic to handle "Auto-sync" if you want to pull from a member's list total
  // In a real scenario, you'd fetch the total count from your database here.
  const syncFromMembers = () => {
    // Example: const realCount = await api.members.count();
    const mockRealCount = '1,240'; // This would come from your actual members page/db
    setForm((prev) => ({ ...prev, churchSize: mockRealCount }));
    toast.info('Synced with actual member database');
  };

  const handleSave = () => {
    // Update global context with new form values
    setChurch({ ...churchData, ...form });
    toast.success('Church profile updated successfully', {
      description: 'Changes are now live across your dashboard.',
    });
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-8 space-y-8 max-w-3xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-[#0B2A4A]">Church Profile</h3>
          <p className="text-xs text-slate-400 font-medium">
            Manage your church's public identity and scale.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
          Brand Identity
        </Label>
        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Upload className="text-slate-300" size={24} />
            )}
          </div>
          <label className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
            Upload Logo
            <input type="file" className="hidden" />
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
          <div className="relative">
            <Input
              className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
              value={form.churchSize}
              placeholder="e.g. 500+"
              onChange={(e) => setForm({ ...form, churchSize: e.target.value })}
            />
          </div>
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

        <div className="sm:col-span-2 space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            About our Church
          </Label>
          <Textarea
            className="bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20 min-h-[120px]"
            placeholder="Tell us about your mission..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
        <Info className="text-blue-400 shrink-0" size={18} />
        <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
          The <strong>Congregation Size</strong> helps us optimize your dashboard analytics. You can
          manually enter an estimate or sync it directly with your registered members list.
        </p>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleSave}
          className="bg-[#0B2A4A] hover:bg-[#081e36] h-12 px-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all active:scale-95"
        >
          Update Profile
        </Button>
      </div>
    </div>
  );
};

export default ChurchProfileTab;
