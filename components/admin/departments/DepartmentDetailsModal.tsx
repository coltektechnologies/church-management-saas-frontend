'use client';

import { useState } from 'react';
import { Department } from '@/types/Department';
import { COLOR_MAP } from '@/constants/departments';

interface Props {
  department: Department;
  onClose: () => void;
}

export default function DepartmentDetailsModal({ department, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'activities' | 'budget' | 'settings'
  >('overview');

  const [isClosing, setIsClosing] = useState(false);

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
          {activeTab === 'overview' && (
            <>
              {/* Info Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                <InfoCard title="Department Head" value="Not Assigned" />
                <InfoCard title="Assistant Head" value="Not Assigned" />
                <InfoCard
                  title="Status"
                  value={department.status === 'active' ? 'Active' : 'Inactive'}
                  isStatus
                />
                <InfoCard
                  title="Date Established"
                  value={new Date(department.dateEstablished).toLocaleDateString()}
                />
              </div>

              {/* Description */}
              <div>
                <h4 className="text-gray-500 mb-2">Department Description</h4>
                <p className="text-lg text-gray-800">
                  {department.description || 'No description provided.'}
                </p>
              </div>

              {/* Stats Section */}
              <div className="grid md:grid-cols-4 gap-6">
                <StatCard label="Total Members" value={department.members} />
                <StatCard label="Upcoming Activities" value={department.activities} />
                <StatCard label="Announcements This Month" value={0} />
                <StatCard label="Budget Utilisation" value={`${department.budgetUsed}%`} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  isStatus,
}: {
  title: string;
  value: string;
  isStatus?: boolean;
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <p className="text-gray-500">{title}</p>
      <div className="mt-2 text-lg font-medium flex items-center gap-2">
        {isStatus && <span className="w-3 h-3 rounded-full bg-green-600"></span>}
        {value}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl text-center">
      <p className="text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
