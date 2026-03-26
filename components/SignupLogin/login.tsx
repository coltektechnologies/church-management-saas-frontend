'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/SignupLogin/Header';
import Footer from '@/components/SignupLogin/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { login as apiLogin } from '@/lib/api';
import { getSafeReturnPath } from '@/lib/safeReturnPath';
import { setChurchSessionCookie } from '@/lib/churchSessionBrowser';

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in (e.g. token in localStorage but cookie missing) — heal cookie + leave login.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }
    setChurchSessionCookie();
    const next = searchParams.get('next');
    router.replace(getSafeReturnPath(next));
  }, [router, searchParams]);

  const styles = {
    wrapper: 'flex min-h-screen flex-col justify-between bg-[#F8F9FA]',
    main: 'flex flex-1 items-center justify-center px-4 py-10 lg:py-16',
    card: 'w-full max-w-[560px] rounded-[30px] bg-white p-8 md:p-14 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700',
    heading: 'text-center text-[32px] font-bold text-[#0B2A4A] mt-6',
    subheading: 'mt-3 text-center text-[15px] text-[#4A5568] max-w-[320px] mx-auto leading-relaxed',
    form: 'mt-10 space-y-5',
    inputGroup: 'space-y-2',
    label: 'text-sm font-bold text-[#0B2A4A]',
    inputField:
      'h-12 rounded-lg border border-gray-200 focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all placeholder:text-gray-300',
    passwordToggle:
      'absolute right-3 top-1/2 -translate-y-1/2 text-[#2FC4B2] hover:opacity-80 transition-colors',
    helperRow: 'flex items-center justify-between mt-4',
    rememberLabel: 'text-[13px] text-[#0B2A4A] font-medium cursor-pointer',
    forgotLink: 'text-[13px] text-[#2FC4B2] font-semibold hover:underline',
    loginBtn:
      'w-full rounded-lg h-12 bg-[#2FC4B2] hover:bg-[#28b0a0] text-white font-bold text-[16px] transition-all shadow-none mt-4',
    signupText: 'text-center mt-8 text-[14px] text-[#4A5568]',
    signupLink: 'text-[#2FC4B2] font-bold hover:underline ml-1',
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      const { user, tokens } = await apiLogin({ email: email.trim(), password });
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      setChurchSessionCookie();
      const next = searchParams.get('next');
      router.push(getSafeReturnPath(next));
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <Header />

      <main className={styles.main}>
        <div className={styles.card}>
          <div className="flex justify-center">
            <Image src={logo} alt="The Open Door Logo" width={180} height={40} priority />
          </div>

          <div className="text-center">
            <h1 className={styles.heading}>Welcome Back!</h1>
            <p className={styles.subheading}>
              Sign in to manage church, staff, and church fronts across your tenants.
            </p>
            {searchParams.get('registered') === '1' && (
              <p
                className="mt-4 rounded-lg border border-[#2FC4B2]/40 bg-[#2FC4B2]/10 px-4 py-3 text-[13px] font-medium text-[#0B2A4A] leading-relaxed"
                role="status"
              >
                Registration complete. Enter your admin email and password below to access your
                dashboard.
              </p>
            )}
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <Label htmlFor="loginEmail" className={styles.label}>
                Email Address
              </Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="you@church.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <Label htmlFor="loginPassword" className={styles.label}>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.inputField} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-[13px] font-medium text-center -mt-2">{error}</p>
            )}

            <div className={styles.helperRow}>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  className="border-[#2FC4B2] data-[state=checked]:bg-[#2FC4B2] data-[state=checked]:border-[#2FC4B2]"
                />
                <Label htmlFor="rememberMe" className={styles.rememberLabel}>
                  Remember me
                </Label>
              </div>
              <Link href="/login/forgetpassword" className={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className={styles.loginBtn}>
              {loading ? 'Signing in...' : 'Log In'}
            </Button>

            <p className={styles.signupText}>
              New to THEOPENDOOR?
              <Link href="/signup" className={styles.signupLink}>
                Start a 30-day free trial
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
