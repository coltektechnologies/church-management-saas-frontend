'use client';

import { useState } from 'react';
import {
  User,
  Church,
  Users,
  Clock,
  CreditCard,
  Wallet,
  Bell,
  Shield,
  SlidersHorizontal,
  ChevronDown,
  Palette,
} from 'lucide-react';

// Tabs
import MyProfileTab from '../MyProfileTab';
import ChurchProfileTab from './ChurchProfileTab';
import AdminManagementTab from './AdminManagementTab';
import ServiceTimesTab from './ServiceTimesTab';
import SubscriptionTab from './SubscriptionTab';
import PaymentSettingsTab from './PaymentSettingsTab';
import NotificationTab from './NotificationTab';
import SecurityTab from './SecurityTab';
import SystemPreferencesTab from './SystemPreferencesTab';
import ColorThemeSettings from './ColorThemeSettings';

import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';

// --- Contrast Utility for Readability ---
const getContrastColor = (hex: string) => {
  if (!hex) {
    return '#0B2A4A';
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0B2A4A' : '#F8FAFC';
};

const TABS = [
  { key: 'profile', label: 'My Profile', icon: User },
  { key: 'church', label: 'Church Profile', icon: Church },
  { key: 'theme', label: 'Color Theme', icon: Palette },
  { key: 'admins', label: 'Admin Management', icon: Users },
  { key: 'services', label: 'Service Times', icon: Clock },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
  { key: 'payment', label: 'Payment Settings', icon: Wallet },
  { key: 'notification', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'system', label: 'System Preferences', icon: SlidersHorizontal },
];

const AccountSettingsContent = () => {
  const { profile } = useChurchProfile();
  const [activeTab, setActiveTab] = useState('profile');
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <MyProfileTab />;
      case 'church':
        return <ChurchProfileTab />;
      case 'theme':
        return <ColorThemeSettings />;
      case 'admins':
        return <AdminManagementTab />;
      case 'services':
        return <ServiceTimesTab />;
      case 'subscription':
        return <SubscriptionTab />;
      case 'payment':
        return <PaymentSettingsTab />;
      case 'notification':
        return <NotificationTab />;
      case 'security':
        return <SecurityTab />;
      case 'system':
        return <SystemPreferencesTab />;
      default:
        return <MyProfileTab />;
    }
  };

  const activeTabData = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const ActiveIcon = activeTabData.icon;

  const bgColor = profile?.backgroundColor || '#F8FAFC';
  const textColor = getContrastColor(bgColor);

  const tabRows = TABS.reduce<(typeof TABS)[]>((rows, tab, i) => {
    const rowIndex = Math.floor(i / 3);
    if (!rows[rowIndex]) {
      rows[rowIndex] = [];
    }
    rows[rowIndex].push(tab);
    return rows;
  }, []);

  return (
    <div
      className="space-y-6 animate-in fade-in duration-500"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div>
        <h2
          className="text-2xl font-black tracking-tight"
          style={{ color: 'var(--primary-brand)' }}
        >
          Account Settings
        </h2>
        <p
          className="text-sm font-medium mt-0.5 transition-colors duration-300"
          style={{ color: textColor }}
        >
          Manage your personal and church-wide configurations.
        </p>
      </div>

      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-[10px] shadow-sm mb-4"
        >
          <span className="flex items-center gap-2 text-black font-semibold">
            <ActiveIcon size={16} style={{ color: 'var(--primary-brand)' }} />
            {activeTabData.label}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {mobileOpen && (
          <div className="mb-4 bg-white border border-slate-100 rounded-[10px] shadow-lg overflow-hidden">
            {tabRows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 last:border-b-0"
              >
                {row.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => {
                        setActiveTab(t.key);
                        setMobileOpen(false);
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 py-4 px-2"
                      style={{
                        backgroundColor: isActive ? '#D9D9D9' : '#FFFFFF',
                        fontSize: 11,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: isActive ? 'var(--primary-brand)' : '#94a3b8' }}
                      />
                      <span className="text-center font-medium">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:flex gap-8 items-start">
        <aside className="w-[214px] shrink-0">
          <nav className="flex flex-col gap-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="flex items-center gap-3 w-full px-4 h-10 rounded-[10px] transition-all"
                  style={{
                    backgroundColor: isActive ? '#D9D9D9' : 'transparent',
                    color: textColor,
                    fontWeight: 500,
                  }}
                >
                  <span className="shrink-0 flex items-center justify-center w-5">
                    <Icon
                      size={15}
                      style={{ color: isActive ? 'var(--primary-brand)' : textColor }}
                    />
                  </span>
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{renderTabContent()}</div>
      </div>

      <div className="lg:hidden">{renderTabContent()}</div>
    </div>
  );
};

export default AccountSettingsContent;
