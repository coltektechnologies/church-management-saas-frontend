'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useChurch } from '@/components/quicksetup/contexts/ChurchContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Landmark,
  Building2,
  Megaphone,
  BarChart3,
  ClipboardCheck,
  Settings,
  Menu,
  X,
  Church,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'members', label: 'Members', icon: Users },
  { key: 'secretary', label: 'Secretary', icon: FileText },
  { key: 'treasury', label: 'Treasury', icon: Landmark },
  { key: 'departments', label: 'Departments', icon: Building2 },
  { key: 'announcement', label: 'Announcement', icon: Megaphone },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'record-approval', label: 'Approvals', icon: ClipboardCheck },
  { key: 'settings', label: 'Settings', icon: Settings },
];

interface DashboardSidebarProps {
  activeNav: string;
  onNavChange: (key: string) => void;
}

const DashboardSidebar = ({ activeNav, onNavChange }: DashboardSidebarProps) => {
  const { church } = useChurch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!church) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open Menu"
        className="fixed top-4 left-4 z-50 lg:hidden text-foreground bg-card rounded-xl p-2.5 border border-border shadow-lg"
      >
        <Menu size={20} />
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-[260px] bg-card border-r border-border
          flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3 min-w-0">
            {church.logoUrl ? (
              <div className="relative w-10 h-10">
                <Image
                  src={church.logoUrl}
                  alt="Church Logo"
                  fill
                  className="rounded-xl object-contain shadow-sm"
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: church.primaryColor || '#0B2A4A' }}
              >
                <Church size={20} className="text-white" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[15px] font-black text-[#0B2A4A] truncate leading-none mb-1">
                {church.churchName}
              </p>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                Administrator
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground p-1 hover:bg-muted rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavChange(item.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${isActive ? 'shadow-lg shadow-primary/20' : 'hover:bg-muted'}`}
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  color: isActive ? '#fff' : '#64748B',
                  backgroundColor: isActive ? church.primaryColor || '#0B2A4A' : 'transparent',
                }}
              >
                <Icon
                  size={18}
                  className={`${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary'} transition-colors`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold text-[13px] transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
