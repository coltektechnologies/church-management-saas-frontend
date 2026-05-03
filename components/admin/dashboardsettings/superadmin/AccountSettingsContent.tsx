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

const TAB_CONTENT: Record<string, React.ReactNode> = {
  profile: <MyProfileTab />,
  church: <ChurchProfileTab />,
  theme: <ColorThemeSettings />,
  admins: <AdminManagementTab />,
  services: <ServiceTimesTab />,
  subscription: <SubscriptionTab />,
  payment: <PaymentSettingsTab />,
  notification: <NotificationTab />,
  security: <SecurityTab />,
  system: <SystemPreferencesTab />,
};

const AccountSettingsContent = () => {
  const { profile } = useChurchProfile();
  const [activeTab, setActiveTab] = useState('profile');
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTabData = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const ActiveIcon = activeTabData.icon;

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
        {/* Header Title: remains branded */}
        <h2
          className="text-2xl font-black tracking-tight"
          style={{ color: 'var(--primary-brand)' }}
        >
          Account Settings
        </h2>
        {/* Dynamic sub-text color based on current background */}
        <p className="text-sm font-medium mt-0.5 transition-colors duration-300 text-muted-foreground">
          Manage your personal and church-wide configurations.
        </p>
      </div>

      {/* MOBILE: dropdown toggle */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[10px] shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: 16 }}
        >
          <span className="flex items-center gap-2 text-foreground">
            <ActiveIcon size={16} style={{ color: 'var(--primary-brand)' }} />
            {activeTabData.label}
          </span>
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {mobileOpen && (
          <div className="mt-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[10px] shadow-lg overflow-hidden dark:ring-1 dark:ring-white/10">
            {tabRows.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="grid grid-cols-3 divide-x divide-[var(--admin-border)] border-b border-[var(--admin-border)] last:border-b-0"
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
                      className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 transition-colors font-[Poppins] font-medium text-[11px] leading-none ${
                        isActive
                          ? 'bg-muted/80 dark:bg-white/12 text-foreground'
                          : 'bg-[var(--admin-surface)] text-foreground/90 hover:bg-muted/40 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon
                        size={18}
                        style={{ color: isActive ? 'var(--primary-brand)' : '#94a3b8' }}
                      />
                      <span className="text-center leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP: sidebar + content */}
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
                  type="button"
                  className={`flex items-center gap-3 w-full text-left transition-all rounded-[10px] font-[Poppins] font-medium text-base leading-none border-none cursor-pointer w-[214px] h-10 pl-4 pr-4 ${
                    isActive
                      ? 'bg-muted/80 dark:bg-white/10 text-foreground'
                      : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon
                    size={15}
                    className={`shrink-0 ${isActive ? '' : 'text-muted-foreground'}`}
                    style={isActive ? { color: 'var(--primary-brand)' } : undefined}
                  />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{TAB_CONTENT[activeTab]}</div>
      </div>

      {/* MOBILE + TABLET: content panel */}
      <div className="lg:hidden">{TAB_CONTENT[activeTab]}</div>
    </div>
  );
};

export default AccountSettingsContent;
