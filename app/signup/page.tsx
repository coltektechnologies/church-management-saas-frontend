// app/signup/page.tsx
import { Suspense } from 'react';
import Signup from '@/components/SignupLogin/signup';
import { Loader2 } from 'lucide-react';

function SignupFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Loader2 className="w-10 h-10 text-[#2FC4B2] animate-spin mb-4" />
      <p className="text-sm font-medium text-[#0B2A4A]">Loading signup…</p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <Signup />
    </Suspense>
  );
}
