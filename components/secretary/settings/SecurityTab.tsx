'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Monitor, Smartphone, KeyRound } from 'lucide-react';

interface TrustedDevice {
  id: string;
  name: string;
  lastActive: string;
  current: boolean;
}

const INITIAL_DEVICES: TrustedDevice[] = [
  { id: '1', name: 'Chrome on MacIntel', lastActive: 'Active Now', current: true },
];

export default function SecurityTab() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(INITIAL_DEVICES);

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

  const toggle2FA = (checked: boolean) => {
    setTwoFAEnabled(checked);
    if (checked) {
      const current = trustedDevices.find((d) => d.current);
      if (!current) {
        const newDevice: TrustedDevice = {
          id: crypto.randomUUID(),
          name:
            typeof navigator !== 'undefined'
              ? navigator.userAgent.includes('Chrome')
                ? `Chrome on ${navigator.platform}`
                : `Browser on ${navigator.platform}`
              : 'Current Browser',
          lastActive: 'Active Now',
          current: true,
        };
        setTrustedDevices((prev) => [...prev.map((d) => ({ ...d, current: false })), newDevice]);
      }
      toast.success('Two-Factor Authentication enabled');
    } else {
      toast.info('Two-Factor Authentication disabled');
    }
  };

  const removeDevice = (id: string) => {
    setTrustedDevices((prev) => prev.filter((d) => d.id !== id));
    toast.info('Device removed from trusted list');
  };

  return (
    <div className="bg-card rounded-[24px] border border-border p-8 space-y-8 max-w-2xl animate-in fade-in duration-500">
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

      {/* Password section */}
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
            className="h-12 rounded-xl bg-muted/20 border-none font-bold"
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
              className="h-12 rounded-xl bg-muted/20 border-none font-bold"
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
              className="h-12 rounded-xl bg-muted/20 border-none font-bold"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleChangePassword}
          className="px-8 h-12 rounded-xl font-bold shadow-lg transition-all"
        >
          Update Password
        </Button>
      </div>

      <hr className="border-border" />

      {/* 2FA toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border">
        <div className="flex gap-4">
          <div className="p-2 bg-card rounded-xl shadow-sm h-fit">
            <Lock size={18} className="text-primary" />
          </div>
          <div>
            <Label className="text-sm font-bold text-foreground">
              Two-Factor Authentication (2FA)
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add an extra layer of security. Trusted devices won&apos;t need codes again.
            </p>
          </div>
        </div>
        <Switch
          checked={twoFAEnabled}
          onCheckedChange={toggle2FA}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {/* Trusted devices / active sessions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-muted-foreground" />
          <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
            {twoFAEnabled ? 'Trusted Devices' : 'Active Sessions'}
          </h4>
        </div>

        {trustedDevices.map((device) => (
          <div
            key={device.id}
            className={`flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:shadow-sm transition-all ${!device.current ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2.5 rounded-xl ${device.current ? 'bg-green-50 text-green-600' : 'bg-muted/20 text-muted-foreground'}`}
              >
                {device.name.includes('iPhone') || device.name.includes('Mobile') ? (
                  <Smartphone size={20} />
                ) : (
                  <Monitor size={20} />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{device.name}</p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {device.current ? 'Current session' : `Last active: ${device.lastActive}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {device.current && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  Active Now
                </Badge>
              )}
              {!device.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDevice(device.id)}
                  className="text-destructive text-xs"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
