'use client';

import { useState } from 'react';
import { Department } from '@/types/Department';
import { COLOR_MAP } from '@/constants/departments';
import AddMemberModal from '@/components/admin/departments/DepartmentDetailsModal/AddMemberModal';
import MembersTab from '@/components/admin/departments/DepartmentDetailsModal/MembersTab';
import OverviewTab from '@/components/admin/departments/DepartmentDetailsModal/OverviewTab';
import ActivitiesTab from '@/components/admin/departments/DepartmentTabs/ActivitiesTab';
import { Activity } from '@/types/activity';

type MockChurchMember = {
  id: string;
  name: string;
  email: string;
};

const mockChurchMembers: MockChurchMember[] = [
  { id: 'm1', name: 'Daniel Mensah', email: 'daniel@email.com' },
  { id: 'm2', name: 'Grace Owusu', email: 'grace@email.com' },
  { id: 'm3', name: 'Samuel Asare', email: 'samuel@email.com' },
  { id: 'm4', name: 'Abena Boateng', email: 'abena@email.com' },
];

interface Props {
  department: Department;
  departmentMembers: { id: string; name: string; role: string; joinedAt: string }[];
  setDepartmentMembers: React.Dispatch<
    React.SetStateAction<{ id: string; name: string; role: string; joinedAt: string }[]>
  >;
  onClose: () => void;
  onUpdateDepartment: (updated: Department) => void;

  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
}

export default function DepartmentDetailsModal({
  department,
  departmentMembers,
  setDepartmentMembers,
  activities,
  onAddActivity,
  onClose,
  onUpdateDepartment,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'activities' | 'budget' | 'settings'
  >('overview');

  const [isClosing, setIsClosing] = useState(false);

  // Local UI members for this modal

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState('Member');

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      onClose();
    }, 160);
  };

  const themeClass = COLOR_MAP[department.themeColor] ?? 'bg-gray-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${
          isClosing ? 'modal-backdrop-out' : 'modal-backdrop-in'
        }`}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white w-full h-full md:h-auto md:w-[95%] md:max-w-6xl rounded-none md:rounded-2xl overflow-hidden shadow-2xl ${
          isClosing ? 'modal-content-out' : 'modal-content-in'
        }`}
      >
        <div className={`${themeClass} px-8 pt-10 pb-8 text-white relative`}>
          <h2 className="text-3xl font-bold">{department.name}</h2>
          <p className="text-lg opacity-90 mt-1">{department.code}</p>

          <button
            onClick={handleClose}
            className="absolute top-6 right-6 bg-white/30 hover:bg-white/50 w-10 h-10 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-10 px-8 border-b border-gray-200">
          {['overview', 'members', 'activities', 'budget', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 capitalize transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? 'border-b-2 border-green-600 text-black font-medium'
                  : 'text-gray-500 hover:text-black hover:border-b-2 hover:border-gray-300'
              }`}
            >
              {tab === 'budget' ? 'Budget & Expenses' : tab}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div key={activeTab} className="p-8 space-y-10 max-h-[70vh] overflow-y-auto tab-slide">
          {activeTab === 'overview' && <OverviewTab department={department} />}
          {activeTab === 'members' && (
            <MembersTab
              department={department}
              departmentMembers={departmentMembers}
              setDepartmentMembers={setDepartmentMembers}
              mockChurchMembers={mockChurchMembers}
              onAddClick={() => setShowAddMember(true)}
              onUpdateDepartment={onUpdateDepartment}
            />
          )}
          {activeTab === 'activities' && (
            <ActivitiesTab
              activities={activities}
              onAddActivity={(newActivity) => {
                onAddActivity(newActivity);
                onUpdateDepartment({
                  ...department,
                  activities: department.activities + 1,
                });
              }}
            />
          )}
        </div>
      </div>
      <AddMemberModal
        show={showAddMember}
        onClose={() => setShowAddMember(false)}
        mockChurchMembers={mockChurchMembers}
        selectedMemberId={selectedMemberId}
        setSelectedMemberId={setSelectedMemberId}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onAdd={() => {
          if (!selectedMemberId) {
            return;
          }

          const member = mockChurchMembers.find((m) => m.id === selectedMemberId);

          if (!member) {
            return;
          }

          setDepartmentMembers((prev) => [
            ...prev,
            {
              id: member.id,
              name: member.name,
              role: selectedRole,
              joinedAt: new Date().toISOString(),
            },
          ]);

          onUpdateDepartment({
            ...department,
            members: departmentMembers.length + 1,
          });

          setShowAddMember(false);
          setSelectedMemberId('');
          setSelectedRole('Member');
        }}
      />
    </div>
  );
}
