'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, X, User, Loader2 } from 'lucide-react';
import { getStoredUser, updateUser } from '@/lib/settingsApi';
import {
  RegistrationEmailField,
  type RegistrationEmailVerificationState,
} from '@/components/forms/RegistrationEmailField';
import {
  isValidSignupEmail,
  sanitizeNoDigits,
  sanitizePersonNameInput,
  sanitizePhoneStripLetters,
} from '@/lib/signupValidation';

const MyProfileTab = () => {
  const { profile, updateProfile } = useChurchProfile();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [emailVerification, setEmailVerification] = useState<RegistrationEmailVerificationState>({
    canProceedEmail: true,
    checking: false,
    remoteError: null,
    flushVerify: () => {},
  });

  const onEmailVerificationState = useCallback((s: RegistrationEmailVerificationState) => {
    setEmailVerification(s);
  }, []);

  const [form, setForm] = useState({
    adminName: profile.adminName || '',
    adminEmail: profile.adminEmail || '',
    adminRole: profile.adminRole || 'Admin',
    adminPhone: profile.adminPhone || '',
    avatarUrl: profile.avatarUrl as string | null,
  });

  useEffect(() => {
    setForm({
      adminName: profile.adminName || '',
      adminEmail: profile.adminEmail || '',
      adminRole: profile.adminRole || 'Admin',
      adminPhone: profile.adminPhone || '',
      avatarUrl: profile.avatarUrl as string | null,
    });
  }, [profile.adminName, profile.adminEmail, profile.adminRole, profile.adminPhone, profile.avatarUrl]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const initials = form.adminName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = async () => {
    const emailTrim = form.adminEmail.trim();
    if (emailTrim && !isValidSignupEmail(emailTrim)) {
      toast.error('Invalid email', { description: 'Enter a valid email address.' });
      return;
    }
    if (emailTrim && isValidSignupEmail(emailTrim)) {
      if (emailVerification.checking) {
        emailVerification.flushVerify();
        toast.error('Wait for email verification', {
          description: 'Finish verifying your email before saving.',
        });
        return;
      }
      if (!emailVerification.canProceedEmail) {
        toast.error('Email not verified', {
          description: emailVerification.remoteError || 'Complete server email verification first.',
        });
        return;
      }
    }

    const user = getStoredUser();
    const nameParts = form.adminName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') ?? '';

    updateProfile({
      adminName: form.adminName,
      adminEmail: form.adminEmail,
      adminRole: form.adminRole,
      adminPhone: form.adminPhone,
      avatarUrl: form.avatarUrl,
    });

    if (user?.id) {
      setSaving(true);
      try {
        await updateUser(user.id, {
          first_name: firstName,
          last_name: lastName,
          email: emailTrim || undefined,
          phone: form.adminPhone || undefined,
        });
        toast.success('Profile updated successfully', {
          description: 'Your name and details are now saved.',
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update profile');
      } finally {
        setSaving(false);
      }
    } else {
      toast.success('Profile updated (local only)', {
        description: 'Sign in to sync with the server.',
      });
    }
  };

  const emailRequiredForVerify = Boolean(form.adminEmail.trim());

  return (
    <div className="bg-[var(--admin-surface)] rounded-[24px] border border-[var(--admin-border)] p-8 space-y-8 max-w-2xl animate-in fade-in duration-500 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10">
      <div>
        <h3 className="text-lg font-black text-[#0B2A4A]">My Profile</h3>
        <p className="text-xs text-slate-400 font-medium">
          Your personal info — shown in the sidebar and top navigation for your account only.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {form.avatarUrl ? (
            <div className="relative w-20 h-20">
              <Image
                src={form.avatarUrl}
                alt={form.adminName}
                fill
                className="rounded-full object-cover border-2 border-slate-100 shadow"
                unoptimized
              />
              <button
                onClick={() => setForm((prev) => ({ ...prev, avatarUrl: null }))}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl shadow"
              style={{ backgroundColor: profile.primaryColor || '#0B2A4A' }}
            >
              {initials || <User size={28} />}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Upload size={14} /> Upload Photo
          </button>
          <p className="text-[10px] text-slate-400 mt-1.5">PNG or JPG, max 2MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</Label>
          <Input
            className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
            value={form.adminName}
            placeholder="Ps Owusu William"
            onChange={(e) =>
              setForm({ ...form, adminName: sanitizePersonNameInput(e.target.value) })
            }
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            Role / Title
          </Label>
          <Input
            className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
            value={form.adminRole}
            placeholder="Admin / Senior Pastor"
            onChange={(e) =>
              setForm({ ...form, adminRole: sanitizeNoDigits(e.target.value) })
            }
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            Email Address
          </Label>
          <RegistrationEmailField
            value={form.adminEmail}
            onChange={(v) => setForm({ ...form, adminEmail: v })}
            scope="admin"
            baselineVerifiedEmail={profile.adminEmail ?? ''}
            onVerificationState={onEmailVerificationState}
            pendingMessage="Verifying with the server… Save stays disabled until this passes."
            inputClassName="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
            placeholder="william@church.org"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
            Phone Number
          </Label>
          <Input
            type="tel"
            className="h-12 bg-slate-50 border-none font-bold rounded-xl focus:ring-2 focus:ring-primary/20"
            value={form.adminPhone}
            placeholder="+233 00 000 0000"
            onChange={(e) =>
              setForm({ ...form, adminPhone: sanitizePhoneStripLetters(e.target.value) })
            }
          />
        </div>
      </div>

      <Button
        onClick={() => void handleSave()}
        disabled={
          saving ||
          (emailRequiredForVerify &&
            isValidSignupEmail(form.adminEmail.trim()) &&
            (emailVerification.checking || !emailVerification.canProceedEmail))
        }
        className="bg-[#0B2A4A] hover:bg-[#081e36] h-12 px-12 rounded-xl font-bold shadow-lg shadow-[#0B2A4A]/20 transition-all active:scale-95 disabled:opacity-70"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          'Save Profile'
        )}
      </Button>
    </div>
  );
};

export default MyProfileTab;
