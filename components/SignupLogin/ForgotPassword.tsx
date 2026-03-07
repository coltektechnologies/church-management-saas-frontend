'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/SignupLogin/Header';
import Footer from '@/components/SignupLogin/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import logo from '@/assets/logo.svg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    // TODO: Replace with real password reset API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  const styles = {
    wrapper: 'flex min-h-screen flex-col justify-between bg-[#F8F9FA]',
    main: 'flex flex-1 items-center justify-center px-4 py-10 lg:py-16',
    card: 'w-full max-w-[520px] rounded-[30px] bg-white p-8 md:p-14 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700',
    label: 'text-sm font-bold text-[#0B2A4A]',
    inputField:
      'h-12 rounded-lg border border-gray-200 focus:ring-[#2FC4B2] focus:border-[#2FC4B2] transition-all placeholder:text-gray-300 pl-10',
    btn: 'w-full rounded-lg h-12 bg-[#2FC4B2] hover:bg-[#28b0a0] text-white font-bold text-[16px] transition-all shadow-none mt-2',
  };

  return (
    <div className={styles.wrapper}>
      <Header />

      <main className={styles.main}>
        <div className={styles.card}>
          <div className="flex justify-center mb-6">
            <Image src={logo} alt="The Open Door Logo" width={160} height={36} priority />
          </div>

          {!submitted ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#2FC4B2]/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#2FC4B2]" />
                </div>
              </div>

              <h1 className="text-center text-[28px] font-bold text-[#0B2A4A]">Forgot Password?</h1>
              <p className="mt-2 text-center text-[14px] text-[#4A5568] max-w-[300px] mx-auto leading-relaxed">
                No worries. Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label className={styles.label}>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@church.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.inputField}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-[13px] font-medium text-center">{error}</p>
                )}

                <Button type="submit" disabled={loading} className={styles.btn}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
            /* Success state */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
              <h2 className="text-[26px] font-bold text-[#0B2A4A] mb-2">Check your email</h2>
              <p className="text-[14px] text-[#4A5568] max-w-[280px] leading-relaxed mb-2">
                We sent a password reset link to
              </p>
              <p className="text-[14px] font-bold text-[#0B2A4A] mb-6">{email}</p>
              <p className="text-[12px] text-gray-400 mb-8">
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#2FC4B2] font-semibold hover:underline"
                >
                  try again
                </button>
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[13px] text-[#2FC4B2] font-semibold hover:underline"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
