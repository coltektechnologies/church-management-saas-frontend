'use client';
import { useState } from 'react';

import { Department } from '@/types/Department';

interface Props {
  department: Department;
  onUpdateDepartment: (updated: Department) => void;
}

export default function SettingsTab({ department, onUpdateDepartment }: Props) {
  const settings = department.settings;
  const [isEditing, setIsEditing] = useState(false);
  const [threshold, setThreshold] = useState(settings.autoApprovalThreshold);

  const handleArchive = () => {
    onUpdateDepartment({
      ...department,
      status: 'inactive',
    });
  };

  return (
    <div className="space-y-10">
      <h3 className="text-xl font-semibold">Department Settings</h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Auto-approval Threshold</p>
          {isEditing ? (
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="border rounded px-2 py-1 w-24"
            />
          ) : (
            <p className="text-lg font-semibold">GHS {settings.autoApprovalThreshold}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Expense requests below this amount are automatically approved.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Requires Elder Approval</p>
          <p className="text-lg font-semibold">{settings.requiresElderApproval ? 'Yes' : 'No'}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Weekly Summary</p>
          <p className="text-lg font-semibold">{settings.weeklySummary ? 'Enabled' : 'Disabled'}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Can Submit Announcements</p>
          <p className="text-lg font-semibold">{settings.canSubmitAnnouncements ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          onClick={() => {
            if (isEditing) {
              onUpdateDepartment({
                ...department,
                settings: {
                  ...settings,
                  autoApprovalThreshold: threshold,
                },
              });
            }

            setIsEditing(!isEditing);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
        >
          {isEditing ? 'Save Settings' : 'Edit Settings'}
        </button>

        <button
          onClick={handleArchive}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition"
        >
          Archive Department
        </button>
      </div>
    </div>
  );
}
