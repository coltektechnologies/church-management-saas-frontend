'use client';

import Image from 'next/image';
import { useChurch } from '@/components/quicksetup/contexts/ChurchContext';
import { Upload, Church, User, Mail, Globe, Info } from 'lucide-react';

const GeneralTab = () => {
  const { church, setChurch } = useChurch();

  const handleChange = (field: string, value: string) => {
    setChurch({ ...church, [field]: value });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
      <div>
        <h3 className="text-2xl font-black text-[#0B2A4A] tracking-tight">General Information</h3>
        <p className="text-sm text-slate-500">
          Update your church identity and primary contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
            Church Logo
          </label>
          <div className="relative group w-44 h-44">
            <div className="w-full h-full rounded-[2.5rem] bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-slate-50">
              {church.logoUrl ? (
                <Image src={church.logoUrl} alt="Logo Preview" fill className="object-cover" />
              ) : (
                <>
                  <Upload
                    size={24}
                    className="text-slate-400 mb-2 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-slate-400">Upload Image</span>
                </>
              )}
            </div>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  handleChange('logoUrl', url);
                }
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic max-w-[180px]">
            Square PNG or JPG recommended.
          </p>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                <Church size={12} /> Church Name
              </label>
              <input
                type="text"
                value={church.churchName || ''}
                onChange={(e) => handleChange('churchName', e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#0B2A4A] focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                <User size={12} /> Lead Administrator
              </label>
              <input
                type="text"
                value={church.adminName || ''}
                onChange={(e) => handleChange('adminName', e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#0B2A4A] focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                <Mail size={12} /> Official Email
              </label>
              <input
                type="email"
                value={church.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#0B2A4A] focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                <Globe size={12} /> Website URL
              </label>
              <input
                type="text"
                value={church.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#0B2A4A] focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
              <Info size={12} /> Church Mission / Bio
            </label>
            <textarea
              rows={4}
              value={church.mission || ''}
              onChange={(e) => handleChange('mission', e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#0B2A4A] focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[10px] font-medium text-slate-400 italic">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <button className="bg-[#0B2A4A] text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-[#0B2A4A]/10 active:scale-95">
          Update Identity
        </button>
      </div>
    </div>
  );
};

export default GeneralTab;
