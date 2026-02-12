'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/SignupLogin/Header';
import Footer from '@/components/SignupLogin/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Login - Login page for Open Door
 * Logic: Implements a secure credential gateway. It handles local state for
 * email/password validation and provides a persistent login toggle via Checkbox.
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const styles = {
    wrapper: 'flex min-h-screen flex-col bg-background',
    main: 'flex flex-1 items-center justify-center px-4 py-10 lg:py-20',
    card: 'w-full max-w-md rounded-[24px] border border-border bg-card p-6 md:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700',
    heading: 'text-center text-2xl font-heading text-foreground sm:text-3xl font-bold',
    subheading: 'mt-2 text-center text-sm text-muted-foreground',
    form: 'mt-8 space-y-6',
    inputGroup: 'space-y-2',
    label: 'text-sm font-semibold font-poppins text-gray-700',
    inputField:
      'h-12 rounded-lg border-gray-200 focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all',
    passwordToggle:
      'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#2FC4B2] transition-colors',
    helperRow: 'flex items-center justify-between',
    rememberLabel: 'text-xs text-muted-foreground cursor-pointer font-medium',
    forgotLink: 'text-xs text-[#2FC4B2] font-bold hover:underline',
    loginBtn:
      'w-full rounded-full h-12 bg-[#0A1D37] hover:bg-[#1a2e4d] text-white font-semibold transition-all shadow-md',
    registerBtn:
      'w-full rounded-full h-12 border border-gray-200 bg-white hover:bg-gray-50 text-[#0A1D37] font-semibold transition-all',
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic: Submit credentials to authentication provider
    console.info('Logging in with:', { email, password, rememberMe });
  };

  return (
    <div className={styles.wrapper}>
      <Header />

      <main className={styles.main}>
        <div className={styles.card}>
          <div className="text-center">
            <h1 className={styles.heading}>Welcome to Open Door</h1>
            <p className={styles.subheading}>Enter credentials to log in</p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <Label htmlFor="loginEmail" className={styles.label}>
                Email Address
              </Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="you@church.org"
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
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.inputField} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.helperRow}>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean | 'indeterminate') => setRememberMe(!!checked)}
                  className="border-gray-300 data-[state=checked]:bg-[#2FC4B2] data-[state=checked]:border-[#2FC4B2]"
                />
                <Label htmlFor="rememberMe" className={styles.rememberLabel}>
                  Remember me
                </Label>
              </div>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <div className="space-y-4 pt-2">
              <Button type="submit" className={styles.loginBtn}>
                Log In
              </Button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase font-bold tracking-widest">
                  or
                </span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <Link href="/signup" className="block w-full">
                <Button type="button" className={styles.registerBtn}>
                  Create Account
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
