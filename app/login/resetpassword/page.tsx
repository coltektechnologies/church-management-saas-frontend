import { Suspense } from 'react';
import ResetPassword from '@/components/SignupLogin/ResetPassword';

export const metadata = {
  title: 'Reset Password | The Open Door',
  description: 'Set a new secure password for your account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-600 text-sm">
          Loading…
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
}
