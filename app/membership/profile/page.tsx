'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
import MembershipTopbar from '@/components/membership/MembershipTopbar';
import ProfileSummaryCard from '@/components/membership/ProfileSummaryCard';
import ProfileTabs from '@/components/membership/ProfileTabs';
import PersonalInfoTab from '@/components/membership/PersonalInfoTab';
import ContactDetailsTab from '@/components/membership/ContactDetailsTab';
import ChurchInfoTab from '@/components/membership/ChurchInfoTab';
import MyContributionsTab from '@/components/membership/MyContributionsTab';
import SettingsTab from '@/components/membership/SettingsTab';
import MemberProfileEditDialog from '@/components/membership/MemberProfileEditDialog';
import { getAccessToken, getCurrentMemberProfile, type MemberDetail } from '@/lib/api';

export default function MembershipProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!getAccessToken()) {
        setMember(null);
        setError('You need to be signed in to view your profile.');
        return;
      }
      const m = await getCurrentMemberProfile();
      setMember(m);
      if (!m) {
        setError(
          'No member profile is linked to your account. Your church administrator can link portal access to your member record.'
        );
      }
    } catch (e) {
      setMember(null);
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <MembershipTopbar
        title="My Profile"
        subtitle="View and manage your personal information"
        icon={<UserCircle className="text-[#2FC4B2]" size={24} />}
      />

      {error && (
        <div
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950"
          role="alert"
        >
          {error}
        </div>
      )}

      <ProfileSummaryCard
        member={member}
        loading={loading}
        onEdit={() => setEditOpen(true)}
        onMemberUpdated={(m) => setMember(m)}
      />

      <MemberProfileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={member}
        onSaved={(m) => setMember(m)}
      />

      <div>
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'personal' && <PersonalInfoTab member={member} loading={loading} />}
        {activeTab === 'contact' && <ContactDetailsTab member={member} loading={loading} />}
        {activeTab === 'church' && <ChurchInfoTab member={member} loading={loading} />}
        {activeTab === 'contributions' && <MyContributionsTab member={member} loading={loading} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
