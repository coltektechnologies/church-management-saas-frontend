// app/signup/page.tsx
import { Suspense } from 'react';
import Login from '@/components/SignupLogin/login';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-600 text-sm">
          Loading…
        </div>
      }
    >
      <Login />
    </Suspense>
  );
}
