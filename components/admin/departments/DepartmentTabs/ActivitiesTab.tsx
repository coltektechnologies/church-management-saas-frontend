'use client';

import { Activity } from '@/types/activity';
import { useState } from 'react';
import ScheduleActivityModal from '../DepartmentDetailsModal/ScheduleActivityModal';

interface Props {
  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
}

export default function ActivitiesTab({ activities, onAddActivity }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Activities</h3>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Schedule New Activity
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.length === 0 && (
          <div className="text-gray-500 text-sm">No activities scheduled yet.</div>
        )}

        {activities.map((activity) => (
          <div key={activity.id} className="bg-gray-50 p-4 rounded-lg hover:shadow-sm transition">
            <div className="flex justify-between">
              <h4 className="font-semibold">{activity.title}</h4>
              <span className="text-sm text-gray-500">
                {new Date(activity.scheduledAt).toLocaleString()}
              </span>
            </div>

            <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
          </div>
        ))}
      </div>

      <ScheduleActivityModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreate={onAddActivity}
      />
    </div>
  );
}
