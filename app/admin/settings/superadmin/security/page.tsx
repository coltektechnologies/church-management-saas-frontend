'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import {
  ArrowLeft,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  LogOut,
  Key,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SESSIONS = [
  {
    id: 1,
    device: 'Chrome on Windows',
    location: 'Accra, Ghana',
    time: 'Now — current session',
    current: true,
  },
  {
    id: 2,
    device: 'Safari on iPhone',
    location: 'Kumasi, Ghana',
    time: '2 hours ago',
    current: false,
  },
  {
    id: 3,
    device: 'Firefox on MacBook',
    location: 'Accra, Ghana',
    time: 'Yesterday at 4:32 PM',
    current: false,
  },
];

export default function SecurityPage() {
  const { profile } = useChurchProfile();
  const pc = profile.primaryColor || '#0B2A4A';

  const [twoFA, setTwoFA] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    newPwd: '',
    confirm: '',
  });

  const strength = (() => {
    const p = passwords.newPwd;
    let s = 0;
    if (p.length >= 8) {
      s++;
    }
    if (/[A-Z]/.test(p)) {
      s++;
    }
    if (/[0-9]/.test(p)) {
      s++;
    }
    if (/[^A-Za-z0-9]/.test(p)) {
      s++;
    }
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'][strength];

  const handleChangePassword = async () => {
    if (!passwords.current) {
      return toast.error('Enter your current password');
    }
    if (passwords.newPwd.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }
    if (passwords.newPwd !== passwords.confirm) {
      return toast.error('Passwords do not match');
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setPasswords({ current: '', newPwd: '', confirm: '' });
    toast.success('Password updated successfully');
  };

  const revokeSession = (_id: number) => {
    toast.success('Session revoked', { description: 'That device has been signed out.' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link
        href="/admin/settings/superadmin"
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-400 hover:text-[#0B2A4A] dark:hover:text-white transition-colors"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <ArrowLeft size={15} /> Back to Settings
      </Link>

      <div>
        <h2
          className="text-2xl font-black text-[#0B2A4A] dark:text-white"
          style={{ fontFamily: 'OV Soge, sans-serif' }}
        >
          Security
        </h2>
        <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          Keep your account and church data safe.
        </p>
      </div>

      {/* Security score */}
      <div
        className="rounded-2xl p-5 flex items-center gap-5"
        style={{ backgroundColor: `${pc}0D`, border: `1px solid ${pc}25` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: pc }}
        >
          <Shield size={26} />
        </div>
        <div className="flex-1">
          <p
            className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Security score
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: twoFA ? '90%' : '50%',
                  backgroundColor: twoFA ? '#10B981' : '#F59E0B',
                }}
              />
            </div>
            <span
              className="text-[12px] font-bold"
              style={{ color: twoFA ? '#10B981' : '#F59E0B', fontFamily: 'Inter, sans-serif' }}
            >
              {twoFA ? 'Strong' : 'Moderate'}
            </span>
          </div>
          {!twoFA && (
            <p
              className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <AlertTriangle size={11} /> Enable 2FA to improve your score
            </p>
          )}
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white dark:bg-[#112240] rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${pc}15` }}
          >
            <Key size={16} style={{ color: pc }} />
          </div>
          <div>
            <h3
              className="text-[15px] font-black text-[#0B2A4A] dark:text-white"
              style={{ fontFamily: 'OV Soge, sans-serif' }}
            >
              Change Password
            </h3>
            <p className="text-[11px] text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Use a strong, unique password
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current password */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Current Password
            </Label>
            <div className="relative">
              <Input
                type={showOld ? 'text' : 'password'}
                className="h-12 bg-slate-50 dark:bg-white/5 border-none font-semibold rounded-xl pr-10"
                value={passwords.current}
                placeholder="••••••••"
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              New Password
            </Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                className="h-12 bg-slate-50 dark:bg-white/5 border-none font-semibold rounded-xl pr-10"
                value={passwords.newPwd}
                placeholder="••••••••"
                onChange={(e) => setPasswords((p) => ({ ...p, newPwd: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwords.newPwd && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1.5 rounded-full transition-all"
                      style={{ backgroundColor: i <= strength ? strengthColor : '#E5E7EB' }}
                    />
                  ))}
                </div>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: strengthColor, fontFamily: 'Inter, sans-serif' }}
                >
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                type={showConf ? 'text' : 'password'}
                className="h-12 bg-slate-50 dark:bg-white/5 border-none font-semibold rounded-xl pr-10"
                value={passwords.confirm}
                placeholder="••••••••"
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowConf((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwords.confirm && passwords.newPwd !== passwords.confirm && (
              <p
                className="text-[11px] text-red-500 flex items-center gap-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <AlertTriangle size={11} /> Passwords don&apos;t match
              </p>
            )}
            {passwords.confirm &&
              passwords.newPwd === passwords.confirm &&
              passwords.confirm.length > 0 && (
                <p
                  className="text-[11px] text-green-500 flex items-center gap-1"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <CheckCircle2 size={11} /> Passwords match
                </p>
              )}
          </div>
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={saving}
          className="h-11 px-8 rounded-xl font-bold text-[13px] transition-all active:scale-95"
          style={{ backgroundColor: pc }}
        >
          {saving ? 'Updating...' : 'Update Password'}
        </Button>
      </div>

      {/* 2FA */}
      <div className="bg-white dark:bg-[#112240] rounded-2xl border border-slate-100 dark:border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${pc}15` }}
            >
              <Smartphone size={16} style={{ color: pc }} />
            </div>
            <div>
              <h3
                className="text-[15px] font-black text-[#0B2A4A] dark:text-white"
                style={{ fontFamily: 'OV Soge, sans-serif' }}
              >
                Two-Factor Authentication
              </h3>
              <p className="text-[11px] text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                Require a code from your phone when signing in
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTwoFA((v) => !v);
              toast.success(twoFA ? '2FA disabled' : '2FA enabled');
            }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300`}
            style={{ backgroundColor: twoFA ? pc : '#E5E7EB' }}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${twoFA ? 'left-[26px]' : 'left-0.5'}`}
            />
          </button>
        </div>
        {twoFA && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-500 shrink-0" />
            <p
              className="text-[12px] text-green-700 dark:text-green-400 font-semibold"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              2FA is active. Your account is well protected.
            </p>
          </div>
        )}
      </div>

      {/* Active sessions */}
      <div className="bg-white dark:bg-[#112240] rounded-2xl border border-slate-100 dark:border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${pc}15` }}
          >
            <Monitor size={16} style={{ color: pc }} />
          </div>
          <div>
            <h3
              className="text-[15px] font-black text-[#0B2A4A] dark:text-white"
              style={{ fontFamily: 'OV Soge, sans-serif' }}
            >
              Active Sessions
            </h3>
            <p className="text-[11px] text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Devices currently signed in to your account
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {SESSIONS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl ${
                s.current
                  ? 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Monitor size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p
                    className="text-[13px] font-semibold text-[#0B2A4A] dark:text-white"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {s.device}
                    {s.current && (
                      <span className="ml-2 text-[10px] font-black text-green-500 uppercase">
                        Current
                      </span>
                    )}
                  </p>
                  <p
                    className="text-[11px] text-gray-400"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {s.location} · {s.time}
                  </p>
                </div>
              </div>
              {!s.current && (
                <button
                  onClick={() => revokeSession(s.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <LogOut size={12} /> Revoke
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => toast.success('All other sessions signed out')}
          className="text-[12px] font-bold text-red-500 hover:underline flex items-center gap-1.5"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <LogOut size={13} /> Sign out all other sessions
        </button>
      </div>
    </div>
  );
}
