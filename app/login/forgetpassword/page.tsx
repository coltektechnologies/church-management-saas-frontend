import { Suspense } from 'react';
import ForgotPassword from '@/components/SignupLogin/ForgotPassword';

export const metadata = {
  title: 'Forgot Password | The Open Door',
  description: 'Reset your church account password.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-600 text-sm">
          Loading…
        </div>
      }
    >
      <ForgotPassword />
    </Suspense>
  );
}
