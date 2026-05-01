'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SessionCookieSync } from '@/components/auth/SessionCookieSync';
import { ChurchProvider } from '@/components/quicksetup/contexts/ChurchContext';
import { DepartmentsProvider } from '@/context/DepartmentsContext';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 30,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionCookieSync />
      <ChurchProvider>
        <DepartmentsProvider>
          {children}
          <Toaster richColors position="top-right" />
        </DepartmentsProvider>
      </ChurchProvider>
    </QueryClientProvider>
  );
}
