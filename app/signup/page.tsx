// app/signup/page.tsx
import { Suspense } from 'react';
import Signup from '@/components/SignupLogin/signup';

function SignupFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2FC4B2] border-t-transparent" />
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
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
