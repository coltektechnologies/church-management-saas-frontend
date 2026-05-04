'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ShieldCheck, Lock, KeyRound, Loader2 } from 'lucide-react';
import { changePassword } from '@/lib/settingsApi';

const SecurityTab = () => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
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

    setChanging(true);
    try {
      await changePassword(currentPw, newPw, confirmPw);
      toast.success('Password changed successfully', {
        description: 'Your security settings have been updated.',
      });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="bg-[var(--admin-surface)] rounded-[24px] border border-[var(--admin-border)] p-8 space-y-8 max-w-2xl animate-in fade-in duration-500 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-foreground tracking-tight">Security Settings</h3>
          <p className="text-xs text-muted-foreground font-medium">
            Protect your account and system access.
          </p>
        </div>
      </div>

      {/* Password Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={16} className="text-muted-foreground" />
          <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
            Change Password
          </h4>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
            Current Password
          </Label>
          <Input
            type="password"
            className="h-12 rounded-xl bg-muted/50 dark:bg-white/5 border border-transparent font-bold text-foreground placeholder:text-muted-foreground"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
              New Password
            </Label>
            <Input
              type="password"
              className="h-12 rounded-xl bg-muted/50 dark:bg-white/5 border border-transparent font-bold text-foreground"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
              Confirm Password
            </Label>
            <Input
              type="password"
              className="h-12 rounded-xl bg-muted/50 dark:bg-white/5 border border-transparent font-bold text-foreground"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={handleChangePassword}
          disabled={changing}
          className="bg-[#0B2A4A] hover:bg-[#081e36] dark:bg-[var(--primary-brand)] dark:hover:opacity-90 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all disabled:opacity-70"
        >
          {changing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
            </>
          ) : (
            'Update Password'
          )}
        </Button>
      </div>

      <hr className="border-[var(--admin-border)]" />

      {/* 2FA Section */}
      <div className="flex items-center justify-between p-4 bg-muted/40 dark:bg-white/[0.04] rounded-2xl border border-[var(--admin-border)]">
        <div className="flex gap-4">
          <div className="p-2 bg-[var(--admin-surface)] rounded-xl shadow-sm h-fit border border-[var(--admin-border)]">
            <Lock size={18} className="text-primary" />
          </div>
          <div>
            <Label className="text-sm font-bold text-foreground">
              Two-Factor Authentication (2FA)
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
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
