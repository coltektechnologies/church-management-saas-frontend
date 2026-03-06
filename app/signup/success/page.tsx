'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getStoredRegistrationSessionId,
  clearStoredRegistrationSessionId,
  registrationVerifyPayment,
} from '@/lib/api';

function getInitialState(reference: string | null): {
  status: 'loading' | 'success' | 'error';
  message: string;
} {
  if (!reference) {
    return {
      status: 'error',
      message: 'Missing payment reference. Please complete registration from the beginning.',
    };
  }
  const parts = reference.split('_');
  const sessionIdFromRef = parts.length >= 3 ? parts[1] : null;
  const sessionId =
    typeof window !== 'undefined'
      ? getStoredRegistrationSessionId() || sessionIdFromRef
      : sessionIdFromRef;
  if (!sessionId) {
    return {
      status: 'error',
      message:
        'Could not find registration session. Please complete registration from the beginning.',
    };
  }
  return { status: 'loading', message: '' };
}

export default function SignupSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const reference = searchParams.get('reference');
  const initialState = getInitialState(reference);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(initialState.status);
  const [message, setMessage] = useState(initialState.message);

  useEffect(() => {
    if (!reference || status !== 'loading') {
      return;
    }
    const parts = reference.split('_');
    const sessionIdFromRef = parts.length >= 3 ? parts[1] : null;
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
        setStatus('success');
        toast({
          title: 'Registration successful!',
          description:
            'Your login credentials have been sent to your email and SMS. Please sign in.',
        });
        router.push('/login');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Payment verification failed.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- status is intentionally excluded: we only want to run when reference changes
  }, [reference, toast, router]);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4">
        <div className="max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#0B2A4A] mb-2">Verification failed</h1>
          <p className="text-gray-600 mb-8">{message}</p>
          <Link href="/signup">
            <Button className="bg-[#2FC4B2] hover:bg-[#28b0a0] text-white">Back to signup</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success: toast already shown and redirect to /login in useEffect
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4">
      <div className="max-w-md w-full text-center">
        <Loader2 className="w-12 h-12 text-[#2FC4B2] animate-spin mx-auto mb-6" />
        <p className="text-[#0B2A4A] font-semibold">
          Registration complete. Redirecting to login...
        </p>
      </div>
    </div>
  );
}
