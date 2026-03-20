'use client';

import { Activity } from '@/types/activity';
import { useState } from 'react';
import ScheduleActivityModal from '../DepartmentDetailsModal/ScheduleActivityModal';
import { usePermissions } from '@/hooks/usePermissions';

interface Props {
  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
}

export default function ActivitiesTab({ activities, onAddActivity, onDeleteActivity }: Props) {
  const { can } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const getStatus = (scheduledAt: string) =>
    new Date(scheduledAt) > new Date() ? 'Upcoming' : 'Completed';

  const formatRelativeDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (Math.abs(diffDays) >= 1) {
      return diffDays > 0
        ? `in ${diffDays} day${diffDays > 1 ? 's' : ''}`
        : `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
    }
    if (Math.abs(diffHours) >= 1) {
      return diffHours > 0
        ? `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
        : `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`;
    }
    if (Math.abs(diffMinutes) >= 1) {
      return diffMinutes > 0 ? `in ${diffMinutes} min` : `${Math.abs(diffMinutes)} min ago`;
    }
    return 'Just now';
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  const filteredActivities = sortedActivities.filter((activity) => {
    const status = getStatus(activity.scheduledAt);
    if (filter === 'upcoming') {
      return status === 'Upcoming';
    }
    if (filter === 'completed') {
      return status === 'Completed';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h3 className="text-lg font-semibold">Recent Activities</h3>
        <div className="flex gap-2">
          {['all', 'upcoming', 'completed'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as typeof filter)}
              className={`px-3 py-1 text-sm rounded-full transition ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {can('canScheduleActivity') && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Schedule New Activity
          </button>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h4 className="text-lg font-semibold text-gray-800">No Activities Scheduled</h4>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              Schedule your first department activity to start organizing events.
            </p>
            {can('canScheduleActivity') && (
              <button
                onClick={() => setIsOpen(true)}
                className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Schedule First Activity
              </button>
            )}
          </div>
        )}

        {filteredActivities.map((activity) => {
          const status = getStatus(activity.scheduledAt);
          return (
            <div
              key={activity.id}
              className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-lg">{activity.title}</h4>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex flex-col text-sm text-gray-500">
                      <span>{formatRelativeDate(activity.scheduledAt)}</span>
                      <span className="text-xs">
                        {new Date(activity.scheduledAt).toLocaleString()}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        status === 'Upcoming'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                {can('canDeleteActivity') && (
                  <button
                    onClick={() => onDeleteActivity(activity.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {can('canScheduleActivity') && (
        <ScheduleActivityModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onCreate={onAddActivity}
        />
      )}
    </div>
  );
}
