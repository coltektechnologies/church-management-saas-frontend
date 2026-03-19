// DashboardLayout.tsx
'use client';

import { useState, ReactNode } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

interface DashboardLayoutProps {
  children?: ReactNode;
  activeNav?: string;
  onNavChange?: (key: string) => void;
}

const DashboardLayout = ({
  children,
  activeNav: controlledNav,
  onNavChange,
}: DashboardLayoutProps) => {
  const [internalNav, setInternalNav] = useState('dashboard');
  const activeNav = controlledNav ?? internalNav;
  const handleNavChange = onNavChange ?? setInternalNav;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <DashboardSidebar activeNav={activeNav} onNavChange={handleNavChange} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-6 lg:px-10 py-5 bg-card border-b border-border sticky top-0 z-20">
          <div className="w-10 lg:hidden" /> {/* Spacer for hamburger */}
          <h1 className="text-xl font-extrabold text-[#0B2A4A] capitalize tracking-tight">
            {activeNav.replace('-', ' ')}
          </h1>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
