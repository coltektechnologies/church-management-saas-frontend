'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import SecretarySidebar from '@/components/secretary/SecretarySidebar';
import SecretaryTopNavbar from '@/components/secretary/SecretaryTopNavbar';

export default function SecretaryLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider defaultRole="secretary">
      <div
        className="min-h-screen flex transition-colors duration-300"
        style={{ backgroundColor: '#F5F7FA' }}
      >
        <SecretarySidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SecretaryTopNavbar />
          <main
            className="flex-1 overflow-y-auto transition-colors duration-300"
            style={{ backgroundColor: '#F5F7FA' }}
          >
            <div className="px-6 py-6 max-w-screen-2xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
