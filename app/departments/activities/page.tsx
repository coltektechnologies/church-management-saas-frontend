'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CalendarDays, MapPin, FileEdit, Users, AreaChart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScheduleActivityModal } from '@/components/departments/activities/ScheduleActivityModal';

const activities = [
  {
    id: 1,
    title: 'Hymn Sing',
    date: '2024-08-17 at 6:00 PM',
    location: 'Music Room',
    status: 'Upcoming',
  },
  {
    id: 2,
    title: 'Hymn Sing',
    date: '2024-08-17 at 6:00 PM',
    location: 'Music Room',
    status: 'Upcoming',
  },
  {
    id: 3,
    title: 'Special Music Sabbath',
    date: '2024-08-17 at 6:00 PM',
    location: 'Music Room',
    status: 'Upcoming',
  },
  {
    id: 4,
    title: 'Hymn Sing',
    date: '2024-08-17 at 6:00 PM',
    location: 'Music Room',
    status: 'Upcoming',
  },
  {
    id: 5,
    title: 'Special Music Sabbath',
    date: '2024-08-17 at 6:00 PM',
    location: 'Music Room',
    status: 'Upcoming',
  },
];

export default function ActivitiesPage() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const handleCreateActivity = () => {
    setIsEditMode(false);
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity: any) => {
    setIsEditMode(true);
    // Parsing date just to have some initial data in the edit form for the mock
    const parsedDate = activity.date.split(' at ')[0];
    const jsDate = new Date(parsedDate);
    const dateString = isNaN(jsDate.getTime()) ? '' : jsDate.toISOString().split('T')[0];

    setSelectedActivity({
      name: activity.title,
      date: dateString || '',
      time: '',
      location: activity.location,
      description: '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="w-full bg-background flex-1 p-4 sm:p-6 lg:px-8 lg:py-6 space-y-5 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1 mb-1">
        <div className="flex items-center gap-2.5 text-info">
          <AreaChart className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Department Activities</h1>
        </div>
        <Button
          onClick={handleCreateActivity}
          className="bg-linear-to-r from-[#0c2a44]  to-[#1c5a8a] text-white hover:opacity-90 w-full sm:w-auto font-medium shadow-sm transition-all rounded-md px-5 py-2"
        >
          + Schedule Activity
        </Button>
      </div>

      <Separator className="bg-foreground/20 mt-5" />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {['Upcoming', 'Past', 'All'].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={`rounded-[8px] px-5 py-1.5 h-9 transition-all duration-200 whitespace-nowrap text-[14px] ${
              activeTab === tab
                ? 'bg-muted-foreground/30 text-secondary-foreground hover:bg-secondary/90 font-medium shadow-sm'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium'
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Activity List */}
      <div className="flex flex-col gap-3.5 pt-1 pb-10">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-muted-foreground/5 border-transparent shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06)] hover:bg-muted-foreground/40 transition-all duration-300 rounded-xl"
          >
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[17px] font-bold text-foreground tracking-tight">
                {activity.title}
              </h3>
              <div className="flex flex-col items-start text-[13px] font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    className="h-4 w-4 text-slate-700 dark:text-slate-300"
                    strokeWidth={1.75}
                  />
                  <span>{activity.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin
                    className="h-4 w-4 text-slate-700 dark:text-slate-300"
                    strokeWidth={1.75}
                  />
                  <span>{activity.location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-row justify-between md:flex-col items-start md:items-end gap-3.5">
              <Badge
                variant="secondary"
                className="bg-info/15 hover:bg-info/25 text-info border-none font-medium px-3.5 py-0.5 text-[12px] rounded-full pointer-events-none"
              >
                {activity.status}
              </Badge>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <button
                  onClick={() => handleEditActivity(activity)}
                  className="hover:text-foreground transition-colors cursor-pointer p-1 hover:bg-secondary/80 rounded-md"
                  title="Edit Activity"
                >
                  <FileEdit className="h-5 w-5" strokeWidth={1.75} />
                  <span className="sr-only">Edit</span>
                </button>
                <button
                  className="hover:text-foreground transition-colors cursor-pointer p-1 hover:bg-secondary/80 rounded-md"
                  title="Manage Members"
                >
                  <Users className="h-5 w-5" strokeWidth={1.75} />
                  <span className="sr-only">View Members</span>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ScheduleActivityModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        isEditing={isEditMode}
        initialData={selectedActivity}
      />
    </div>
  );
}
