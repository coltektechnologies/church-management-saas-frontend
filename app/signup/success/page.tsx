'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, XCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getStoredRegistrationSessionId,
  clearStoredRegistrationSessionId,
  registrationVerifyPayment,
} from '@/lib/api';
import { setChurchSessionCookie } from '@/lib/churchSessionBrowser';

/** Parse REG_{uuid}_{timestamp} — UUID contains hyphens, must not split on every underscore. */
function parseSessionIdFromReference(reference: string): string | null {
  if (!reference?.startsWith('REG_')) return null;
  const body = reference.slice(4);
  const lastUnderscore = body.lastIndexOf('_');
  if (lastUnderscore <= 0) return null;
  const sessionPart = body.slice(0, lastUnderscore);
  const tail = body.slice(lastUnderscore + 1);
  return tail && /^\d+$/.test(tail) ? sessionPart : null;
}

function getInitialState(reference: string | null): {
  status: 'loading' | 'success' | 'error';
  message: string;
} {
  if (!reference) {
    return {
      status: 'error',
      message: 'Missing payment reference. Please start registration again and complete payment.',
    };
  }
  const sessionIdFromRef = parseSessionIdFromReference(reference);
  const sessionId =
    typeof window !== 'undefined'
      ? getStoredRegistrationSessionId() || sessionIdFromRef
      : sessionIdFromRef;
  if (!sessionId) {
    return {
      status: 'error',
      message:
        'We could not link this payment to your registration session. Please register again from the beginning.',
    };
  }
  return { status: 'loading', message: '' };
}

function SignupSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const reference = searchParams.get('reference');
  const initialState = getInitialState(reference);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(initialState.status);
  const [message, setMessage] = useState(initialState.message);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!reference || status !== 'loading' || verified) {
      return;
    }
    const sessionIdFromRef = parseSessionIdFromReference(reference);
    const sessionId = getStoredRegistrationSessionId() || sessionIdFromRef;
    if (!sessionId) {
      return;
    }

    registrationVerifyPayment(sessionId, reference)
      .then((result) => {
        clearStoredRegistrationSessionId();
        localStorage.setItem('access_token', result.tokens.access);
        localStorage.setItem('refresh_token', result.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(result.user));
        setChurchSessionCookie();
        setVerified(true);
        setStatus('success');
        toast({
          title: 'Registration successful!',
          description:
            'Your login credentials have been sent to your email and SMS when applicable. You can sign in now.',
        });
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Payment verification failed.');
      });
  }, [reference, toast, verified, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4">
        <Loader2 className="w-12 h-12 text-[#2FC4B2] animate-spin mb-6" />
        <p className="text-[#0B2A4A] font-semibold">Verifying your payment...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-12">
        <div className="max-w-md w-full text-center rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#0B2A4A] mb-2">
            Registration could not be completed
          </h1>
          <p className="text-gray-600 mb-2 text-sm leading-relaxed">{message}</p>
          <p className="text-gray-500 text-xs mb-8">
            Your payment may not have been confirmed, or the link is invalid. Start over to try
            again.
          </p>
          <Link href="/signup?restart=1" className="block w-full">
            <Button className="w-full h-12 bg-[#2FC4B2] hover:bg-[#28b0a0] text-white font-bold rounded-xl">
              Start registration again
            </Button>
          </Link>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-semibold text-[#0B2A4A] hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  /* Success: stay on this screen until the user goes to login */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-12">
      <div className="max-w-md w-full text-center rounded-2xl border border-[#2FC4B2]/30 bg-white p-10 shadow-lg">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-[#2FC4B2]/20 rounded-full animate-ping opacity-30" />
          <div className="relative w-20 h-20 rounded-full bg-[#2FC4B2]/15 flex items-center justify-center">
            <Check className="w-10 h-10 text-[#2FC4B2] stroke-[3]" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-[#0B2A4A] mb-3">You&apos;re registered!</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Your church account is ready. Check your email and SMS for login details if we sent them.
          Use the button below to sign in to your dashboard.
        </p>
        <Button
          className="w-full h-12 bg-[#0B2A4A] hover:bg-black text-white font-bold rounded-xl"
          onClick={() => router.push('/login')}
        >
          Continue to login
        </Button>
      </div>
    </div>
  );
}

export default function SignupSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4">
          <Loader2 className="w-12 h-12 text-[#2FC4B2] animate-spin mb-6" />
          <p className="text-[#0B2A4A] font-semibold">Loading...</p>
        </div>
      }
    >
      <SignupSuccessContent />
    </Suspense>
  );
}
