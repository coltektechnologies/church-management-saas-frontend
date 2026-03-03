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

const TABS = [
  { key: 'profile', label: 'My Profile', icon: User },
  { key: 'church', label: 'Church Profile', icon: Church },
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
  admins: <AdminManagementTab />,
  services: <ServiceTimesTab />,
  subscription: <SubscriptionTab />,
  payment: <PaymentSettingsTab />,
  notification: <NotificationTab />,
  security: <SecurityTab />,
  system: <SystemPreferencesTab />,
};

const AccountSettingsContent = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTabData = TABS.find((t) => t.key === activeTab)!;
  const ActiveIcon = activeTabData.icon;

  // Split tabs into rows of 3 for the mobile grid
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
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-black text-[#0B2A4A] tracking-tight">Account Settings</h2>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Manage your personal and church-wide configurations.
        </p>
      </div>

      {/* ── MOBILE: dropdown toggle (xs only) ── */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-[10px] shadow-sm"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: 16 }}
        >
          <span className="flex items-center gap-2 text-black">
            <ActiveIcon size={16} className="text-[#0B2A4A]" />
            {activeTabData.label}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {mobileOpen && (
          <div className="mt-2 bg-white border border-slate-100 rounded-[10px] shadow-lg overflow-hidden">
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
                      className="flex flex-col items-center justify-center gap-1.5 py-4 px-2 transition-colors"
                      style={{
                        backgroundColor: isActive ? '#D9D9D9' : '#FFFFFF',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 500,
                        fontSize: 11,
                        color: '#000000',
                        lineHeight: '100%',
                      }}
                    >
                      <Icon size={18} className={isActive ? 'text-[#0B2A4A]' : 'text-slate-400'} />
                      <span className="text-center leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── TABLET: horizontal scrollable pill row (sm only) ── */}
      <div className="hidden sm:flex lg:hidden gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-[10px] transition-all"
              style={{
                width: 214,
                height: 40,
                backgroundColor: isActive ? '#D9D9D9' : '#FFFFFF',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: '#000000',
                lineHeight: '100%',
                letterSpacing: 0,
                border: isActive ? 'none' : '1px solid #e2e8f0',
                borderRadius: 10,
                opacity: 1,
              }}
            >
              <Icon size={15} className={isActive ? 'text-[#0B2A4A]' : 'text-slate-400'} />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── DESKTOP: sidebar + content ── */}
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
                  className="flex items-center gap-3 w-full text-left transition-all"
                  style={{
                    width: 214,
                    height: 40,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderRadius: 10,
                    backgroundColor: isActive ? '#D9D9D9' : '#FFFFFF',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: 16,
                    color: '#000000',
                    lineHeight: '100%',
                    letterSpacing: 0,
                    opacity: 1,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon
                    size={15}
                    className="shrink-0"
                    style={{ color: isActive ? '#0B2A4A' : '#94a3b8' }}
                  />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{TAB_CONTENT[activeTab]}</div>
      </div>

      {/* ── MOBILE + TABLET: content panel (below nav) ── */}
      <div className="lg:hidden">{TAB_CONTENT[activeTab]}</div>
    </div>
  );
};

export default AccountSettingsContent;
