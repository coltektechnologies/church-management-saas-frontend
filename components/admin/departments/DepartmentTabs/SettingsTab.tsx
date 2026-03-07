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
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local editable state for all settings
  const [threshold, setThreshold] = useState(settings.autoApprovalThreshold);
  const [requiresElderApproval, setRequiresElderApproval] = useState(
    settings.requiresElderApproval
  );
  const [weeklySummary, setWeeklySummary] = useState(settings.weeklySummary);
  const [canSubmitAnnouncements, setCanSubmitAnnouncements] = useState(
    settings.canSubmitAnnouncements
  );

  const handleSave = () => {
    onUpdateDepartment({
      ...department,
      settings: {
        autoApprovalThreshold: threshold,
        requiresElderApproval,
        weeklySummary,
        canSubmitAnnouncements,
      },
    });

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancelEdit = () => {
    // Reset local state back to current department settings
    setThreshold(settings.autoApprovalThreshold);
    setRequiresElderApproval(settings.requiresElderApproval);
    setWeeklySummary(settings.weeklySummary);
    setCanSubmitAnnouncements(settings.canSubmitAnnouncements);
    setIsEditing(false);
  };

  const handleArchive = () => {
    onUpdateDepartment({
      ...department,
      status: 'inactive',
    });
    setShowArchiveConfirm(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Department Settings</h3>

        {/* Success message */}
        {saveSuccess && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
            ✓ Settings saved successfully
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Auto-approval Threshold */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Auto-approval Threshold</p>
          {isEditing ? (
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="border rounded-lg px-3 py-1.5 w-32 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ) : (
            <p className="text-lg font-semibold mt-1">GHS {settings.autoApprovalThreshold}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Expense requests below this amount are automatically approved.
          </p>
        </div>

        {/* Requires Elder Approval */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Requires Elder Approval</p>
          {isEditing ? (
            <select
              value={requiresElderApproval ? 'yes' : 'no'}
              onChange={(e) => setRequiresElderApproval(e.target.value === 'yes')}
              className="border rounded-lg px-3 py-1.5 mt-1 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          ) : (
            <p className="text-lg font-semibold mt-1">
              {settings.requiresElderApproval ? 'Yes' : 'No'}
            </p>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Weekly Summary</p>
          {isEditing ? (
            <select
              value={weeklySummary ? 'enabled' : 'disabled'}
              onChange={(e) => setWeeklySummary(e.target.value === 'enabled')}
              className="border rounded-lg px-3 py-1.5 mt-1 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          ) : (
            <p className="text-lg font-semibold mt-1">
              {settings.weeklySummary ? 'Enabled' : 'Disabled'}
            </p>
          )}
        </div>

        {/* Can Submit Announcements */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Can Submit Announcements</p>
          {isEditing ? (
            <select
              value={canSubmitAnnouncements ? 'yes' : 'no'}
              onChange={(e) => setCanSubmitAnnouncements(e.target.value === 'yes')}
              className="border rounded-lg px-3 py-1.5 mt-1 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          ) : (
            <p className="text-lg font-semibold mt-1">
              {settings.canSubmitAnnouncements ? 'Yes' : 'No'}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Save Settings
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Edit Settings
            </button>
            <button
              onClick={() => setShowArchiveConfirm(true)}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition"
            >
              Archive Department
            </button>
          </>
        )}
      </div>

      {/* Archive Confirmation */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowArchiveConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Archive Department?</h4>
            <p className="text-sm text-gray-600">
              This will mark <span className="font-medium">{department.name}</span> as inactive.
              Members and data will be preserved but the department won't appear as active.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                Yes, Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
