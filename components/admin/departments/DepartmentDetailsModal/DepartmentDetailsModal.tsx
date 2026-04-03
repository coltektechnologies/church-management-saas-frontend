'use client';

import { useState } from 'react';
import { Department } from '@/types/Department';
import { COLOR_MAP } from '@/constants/departments';
import AddMemberModal from '@/components/admin/departments/DepartmentDetailsModal/AddMemberModal';
import MembersTab from '@/components/admin/departments/DepartmentTabs/MembersTab';
import OverviewTab from '@/components/admin/departments/DepartmentTabs/OverviewTab';
import ActivitiesTab from '@/components/admin/departments/DepartmentTabs/ActivitiesTab';
import { Activity } from '@/types/activity';
import type { Expense } from '@/types/expense';
import BudgetTab from '@/components/admin/departments/DepartmentTabs/BudgetTab';
import SettingsTab from '@/components/admin/departments/DepartmentTabs/SettingsTab';
import { usePermissions } from '@/hooks/usePermissions';
import type { MemberListItem } from '@/lib/api';
import type { DepartmentMemberUI } from '@/lib/departmentsApi';

function memberDisplayName(m: MemberListItem): string {
  if (m.full_name?.trim()) {
    return m.full_name.trim();
  }
  const parts = [m.first_name, m.last_name].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Member';
}

interface Props {
  department: Department;
  departmentMembers: DepartmentMemberUI[];
  setDepartmentMembers: React.Dispatch<React.SetStateAction<DepartmentMemberUI[]>>;
  churchMembers: MemberListItem[];
  onClose: () => void;
  onUpdateDepartment: (updated: Department) => void;
  activities: Activity[];
  onAddActivity: (activity: Activity) => void | Promise<void>;
  onDeleteActivity: (activityId: string) => void;
  expenses: Expense[];
  onAssignMember: (memberId: string, role: string) => Promise<void>;
  onLeadershipSaved: () => Promise<void>;
}

type TabKey = 'overview' | 'members' | 'activities' | 'budget' | 'settings';

export default function DepartmentDetailsModal({
  department,
  departmentMembers,
  setDepartmentMembers,
  churchMembers,
  activities,
  onAddActivity,
  onDeleteActivity,
  onClose,
  onUpdateDepartment,
  expenses,
  onAssignMember,
  onLeadershipSaved,
}: Props) {
  const { can } = usePermissions();

  const allTabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'members', label: 'Members' },
    { key: 'activities', label: 'Activities' },
    { key: 'budget', label: 'Budget & Expenses' },
    ...(can('canViewSettings') ? [{ key: 'settings' as TabKey, label: 'Settings' }] : []),
  ];

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isClosing, setIsClosing] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState('Member');
  const [addMemberError, setAddMemberError] = useState('');
  const [assigningMember, setAssigningMember] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 160);
  };

  const themeClass = COLOR_MAP[department.themeColor] ?? 'bg-gray-700';

  const memberOptions = churchMembers.map((m) => ({
    id: m.id,
    name: memberDisplayName(m),
    email: (m.location?.email as string | undefined) ?? '',
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${isClosing ? 'modal-backdrop-out' : 'modal-backdrop-in'}`}
      />

      <div
        className={`relative bg-white w-full h-full md:h-auto md:w-[95%] md:max-w-6xl rounded-none md:rounded-2xl overflow-hidden shadow-2xl ${isClosing ? 'modal-content-out' : 'modal-content-in'}`}
      >
        <div className={`${themeClass} px-8 pt-10 pb-8 text-white relative`}>
          <h2 className="text-3xl font-bold">{department.name}</h2>
          <p className="text-lg opacity-90 mt-1">{department.code}</p>
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-6 right-6 bg-white/30 hover:bg-white/50 w-10 h-10 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-10 px-8 border-b border-gray-200">
          {allTabs.map(({ key, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-4 capitalize transition-all duration-200 cursor-pointer ${
                activeTab === key
                  ? 'border-b-2 border-green-600 text-black font-medium'
                  : 'text-gray-500 hover:text-black hover:border-b-2 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div key={activeTab} className="p-8 space-y-10 max-h-[70vh] overflow-y-auto tab-slide">
          {activeTab === 'overview' && (
            <OverviewTab department={department} departmentMembers={departmentMembers} />
          )}
          {activeTab === 'members' && (
            <MembersTab
              department={department}
              departmentMembers={departmentMembers}
              setDepartmentMembers={setDepartmentMembers}
              churchMemberOptions={memberOptions}
              onAddClick={() => setShowAddMember(true)}
              onUpdateDepartment={onUpdateDepartment}
            />
          )}
          {activeTab === 'activities' && (
            <ActivitiesTab
              activities={activities}
              onAddActivity={async (newActivity) => {
                await onAddActivity(newActivity);
              }}
              onDeleteActivity={onDeleteActivity}
            />
          )}
          {activeTab === 'budget' && <BudgetTab department={department} expenses={expenses} />}
          {activeTab === 'settings' && can('canViewSettings') && (
            <SettingsTab
              department={department}
              onUpdateDepartment={onUpdateDepartment}
              churchMembers={churchMembers}
              departmentMembers={departmentMembers}
              onLeadershipSaved={onLeadershipSaved}
            />
          )}
        </div>
      </div>

      <AddMemberModal
        show={showAddMember}
        onClose={() => {
          setShowAddMember(false);
          setAddMemberError('');
        }}
        mockChurchMembers={memberOptions}
        selectedMemberId={selectedMemberId}
        setSelectedMemberId={(id) => {
          setSelectedMemberId(id);
          setAddMemberError('');
        }}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        error={addMemberError}
        assigning={assigningMember}
        onAdd={async () => {
          if (!selectedMemberId) {
            return;
          }
          if (departmentMembers.some((m) => m.id === selectedMemberId)) {
            setAddMemberError('This member has already been added to this department.');
            return;
          }
          setAssigningMember(true);
          setAddMemberError('');
          try {
            await onAssignMember(selectedMemberId, selectedRole);
            setShowAddMember(false);
            setSelectedMemberId('');
            setSelectedRole('Member');
          } catch (e) {
            setAddMemberError(e instanceof Error ? e.message : 'Could not add member');
          } finally {
            setAssigningMember(false);
          }
        }}
      />
    </div>
  );
}
