'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

const AccountSettingsContent = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-[#0B2A4A] tracking-tight">Account Settings</h2>
        <p className="text-sm text-slate-500">
          Manage your personal and church-wide configurations.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 border-b border-slate-100 pb-4 rounded-none justify-start">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                  data-[state=active]:bg-[#0B2A4A] data-[state=active]:text-white data-[state=active]:shadow-lg
                  data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-50"
              >
                <Icon size={14} /> {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile">
            <MyProfileTab />
          </TabsContent>
          <TabsContent value="church">
            <ChurchProfileTab />
          </TabsContent>
          <TabsContent value="admins">
            <AdminManagementTab />
          </TabsContent>
          <TabsContent value="services">
            <ServiceTimesTab />
          </TabsContent>
          <TabsContent value="subscription">
            <SubscriptionTab />
          </TabsContent>
          <TabsContent value="payment">
            <PaymentSettingsTab />
          </TabsContent>
          <TabsContent value="notification">
            <NotificationTab />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          <TabsContent value="system">
            <SystemPreferencesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AccountSettingsContent;
