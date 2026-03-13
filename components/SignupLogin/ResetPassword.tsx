'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/SignupLogin/Header';
import Footer from '@/components/SignupLogin/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft, Info } from 'lucide-react';
import logo from '@/assets/logo.svg';

const ResetPassword = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!password.trim()) {
      newErrors.password = 'Required';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Must include uppercase, lowercase, number and symbol (@$!%*?&#)';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    // TODO: Replace with real reset API call using token from URL
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    }, 1000);
  };

  const styles = {
    wrapper: 'flex min-h-screen flex-col justify-between bg-[#F8F9FA]',
    main: 'flex flex-1 items-center justify-center px-4 py-10 lg:py-16',
    card: 'w-full max-w-[520px] rounded-[30px] bg-white p-8 md:p-14 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700',
    label: 'text-sm font-bold text-[#0B2A4A]',
    inputField:
      'h-12 rounded-lg border border-gray-200 focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all placeholder:text-gray-300',
    btn: 'w-full rounded-lg h-12 bg-[#2FC4B2] hover:bg-[#28b0a0] text-white font-bold text-[16px] transition-all shadow-none mt-2',
    errorText: 'text-red-500 text-[11px] font-medium flex items-start gap-1 mt-1',
    toggle: 'absolute right-3 top-1/2 -translate-y-1/2 text-[#2FC4B2] hover:opacity-80',
  };

  // Password strength indicator
  const getStrength = () => {
    if (!password) {
      return { width: '0%', color: 'bg-gray-200', label: '' };
    }
    if (password.length < 6) {
      return { width: '25%', color: 'bg-red-400', label: 'Weak' };
    }
    if (!passwordRegex.test(password) && password.length < 10) {
      return { width: '50%', color: 'bg-yellow-400', label: 'Fair' };
    }
    if (!passwordRegex.test(password)) {
      return { width: '75%', color: 'bg-blue-400', label: 'Good' };
    }
    return { width: '100%', color: 'bg-green-500', label: 'Strong' };
  };

  const strength = getStrength();

  return (
    <div className={styles.wrapper}>
      <Header />

      <main className={styles.main}>
        <div className={styles.card}>
          <div className="flex justify-center mb-6">
            <Image src={logo} alt="The Open Door Logo" width={160} height={36} priority />
          </div>

          {!success ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#2FC4B2]/10 flex items-center justify-center">
                  <KeyRound className="w-8 h-8 text-[#2FC4B2]" />
                </div>
              </div>

              <h1 className="text-center text-[28px] font-bold text-[#0B2A4A]">Set New Password</h1>
              <p className="mt-2 text-center text-[14px] text-[#4A5568] max-w-[300px] mx-auto leading-relaxed">
                Your new password must be different from your previous one.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {/* New Password */}
                <div className="space-y-1">
                  <Label className={styles.label}>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${styles.inputField} pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.toggle}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium">{strength.label}</p>
                    </div>
                  )}

                  {errors.password && (
                    <p className={styles.errorText}>
                      <Info size={11} className="mt-0.5 shrink-0" /> {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <Label className={styles.label}>Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${styles.inputField} pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className={styles.toggle}
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className={styles.errorText}>{errors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" disabled={loading} className={styles.btn}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>

                <div className="text-center mt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-[13px] text-[#2FC4B2] font-semibold hover:underline"
                  >
                    <ArrowLeft size={14} />
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            /* Success state — auto redirects to login */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
              <h2 className="text-[26px] font-bold text-[#0B2A4A] mb-2">Password Reset!</h2>
              <p className="text-[14px] text-[#4A5568] max-w-[260px] leading-relaxed mb-6">
                Your password has been reset successfully. Redirecting you to login...
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[13px] text-[#2FC4B2] font-semibold hover:underline"
              >
                <ArrowLeft size={14} />
                Go to Login now
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;
