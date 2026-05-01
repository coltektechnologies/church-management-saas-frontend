'use client';

import { useState } from 'react';
import { UserCircle } from 'lucide-react';
import MembershipTopbar from '@/components/membership/MembershipTopbar';
import ProfileSummaryCard from '@/components/membership/ProfileSummaryCard';
import ProfileTabs from '@/components/membership/ProfileTabs';
import PersonalInfoTab from '@/components/membership/PersonalInfoTab';
import ContactDetailsTab from '@/components/membership/ContactDetailsTab';
import ChurchInfoTab from '@/components/membership/ChurchInfoTab';
import MyContributionsTab from '@/components/membership/MyContributionsTab';
import SettingsTab from '@/components/membership/SettingsTab';

export default function MembershipProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <MembershipTopbar
        title="My Profile"
        subtitle="View and manage your personal information"
        icon={<UserCircle className="text-[#2FC4B2]" size={24} />}
      />

      <ProfileSummaryCard />

      <div>
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'personal' && <PersonalInfoTab />}
        {activeTab === 'contact' && <ContactDetailsTab />}
        {activeTab === 'church' && <ChurchInfoTab />}
        {activeTab === 'contributions' && <MyContributionsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
