'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ShieldCheck, Lock, KeyRound } from 'lucide-react';

const SecurityTab = () => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  const handleChangePassword = () => {
    if (!currentPw || !newPw) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPw.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    toast.success('Password changed successfully', {
      description: 'Your security settings have been updated.',
    });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#0B2A4A] tracking-tight">Security Settings</h3>
          <p className="text-xs text-slate-400 font-medium">
            Protect your account and system access.
          </p>
        </div>
      </div>

      {/* Password Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={16} className="text-slate-400" />
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Change Password
          </h4>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            Current Password
          </Label>
          <Input
            type="password"
            className="h-12 rounded-xl bg-slate-50 border-none font-bold"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              New Password
            </Label>
            <Input
              type="password"
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Confirm Password
            </Label>
            <Input
              type="password"
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={handleChangePassword}
          className="bg-[#0B2A4A] hover:bg-[#081e36] text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all"
        >
          Update Password
        </Button>
      </div>

      <hr className="border-slate-50" />

      {/* 2FA Section */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
            <Lock size={18} className="text-primary" />
          </div>
          <div>
            <Label className="text-sm font-bold text-[#0B2A4A]">
              Two-Factor Authentication (2FA)
            </Label>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add an extra layer of security to your login process.
            </p>
          </div>
        </div>
        <Switch
          checked={twoFactor}
          onCheckedChange={setTwoFactor}
          className="data-[state=checked]:bg-[#2FC4B2]"
        />
      </div>
    </div>
  );
};

export default SecurityTab;
