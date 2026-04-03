'use client';

import { useRouter } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

// ─── Soft-coded style constants ───────────────────────────────────────────────
const STYLE = {
  containerRadius: '10px', // Outer card corner radius
  containerBgLight: '#FFFFFF', // Card background light mode
  containerBgDark: '#1A2B45', // Card background dark mode
  containerBorderLight: '#E5E7EB', // Card border light mode
  containerBorderDark: '#2A3F5F', // Card border dark mode
  titleColorLight: '#2FC4B2', // Title + icon color light (accentColor from profile)
  dividerColorLight: '#E5E7EB', // Divider line color light
  dividerColorDark: '#2A3F5F', // Divider line color dark
  // Activity placeholder card
  itemBg: '#EEEEEF', // Placeholder card background
  itemRadius: '10px', // Placeholder card corner radius
  itemTextColor: '#111111', // Placeholder card text color
  itemSubColor: '#6B7280', // Placeholder card sub-text color
  itemDateColor: '#6B7280', // Date badge on right side
  // View All button
  btnBg: '#EEEEEF', // Button background
  btnBorder: '#6B7280', // Button border color
  btnRadius: '8px', // Button corner radius
  btnShadow: '0px 1px 3px rgba(15,23,42,0.08)', // Button shadow
  btnTextLight: '#111111', // Button text light mode
  btnTextDark: '#F0F4F8', // Button text dark mode
};

// Activities route — linked to the activities page
const ACTIVITIES_ROUTE = '/departments/activities';

export interface DeptActivity {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
}

// Dummy data for testing — replace with live API data
const DEFAULT_ACTIVITIES: DeptActivity[] = [
  {
    id: '1',
    name: 'Choir Practice',
    date: '2026-08-20',
    time: '7:00 PM',
    location: 'Music Room',
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Special Music Sabbath',
    date: '2024-08-24',
    time: '11:00 AM',
    location: 'Sanctuary',
    status: 'upcoming',
  },
];

interface Props {
  activities?: DeptActivity[];
}

export default function DeptUpcomingActivities({ activities = DEFAULT_ACTIVITIES }: Props) {
  const router = useRouter();
  const { profile, isReady } = useDepartmentProfile();

  const isDark = isReady ? profile.darkMode : false;
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const containerBg = isDark ? STYLE.containerBgDark : STYLE.containerBgLight;
  const containerBorder = isDark ? STYLE.containerBorderDark : STYLE.containerBorderLight;
  const dividerColor = isDark ? STYLE.dividerColorDark : STYLE.dividerColorLight;
  const btnText = isDark ? STYLE.btnTextDark : STYLE.btnTextLight;

  return (
    <div
      className="p-5 sm:p-6 flex flex-col gap-0 border"
      style={{
        borderRadius: STYLE.containerRadius,
        backgroundColor: containerBg,
        borderColor: containerBorder,
      }}
    >
      {/* Header row — title + icon + View All button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} style={{ color: accentColor }} />
          <h3
            className="text-base sm:text-lg"
            style={{
              color: accentColor,
              fontFamily: 'Poppins',
              fontWeight: '700',
              fontSize: '24px',
            }}
          >
            Upcoming Activities
          </h3>
        </div>
        {/* View All — navigates to activities page */}
        <button
          onClick={() => router.push(ACTIVITIES_ROUTE)}
          className="text-xs sm:text-sm font-semibold px-3 py-1.5 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          style={{
            backgroundColor: STYLE.btnBg,
            borderRadius: STYLE.btnRadius,
            boxShadow: STYLE.btnShadow,
            color: btnText,
            fontFamily: 'Poppins',
            fontWeight: '400',
            fontSize: '13px',
          }}
        >
          View All
        </button>
      </div>

      {/* Divider  inset from edges to match screenshot */}
      <div
        className="mb-4"
        style={{ height: '1px', backgroundColor: dividerColor, marginLeft: 0, marginRight: 0 }}
      />

      {/* Activity list */}
      <div className="flex flex-col gap-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays size={32} style={{ color: accentColor, opacity: 0.3 }} className="mb-2" />
            <p
              className="text-sm font-medium"
              style={{ color: STYLE.itemSubColor, fontFamily: 'Poppins' }}
            >
              No upcoming activities
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4"
              style={{
                backgroundColor: STYLE.itemBg, // #EEEEEF placeholder card bg
                borderRadius: STYLE.itemRadius, // 10px card radius
              }}
            >
              {/* Left: icon + name + date/time/location */}
              <div className="flex items-center gap-3 min-w-0">
                <CalendarDays size={18} style={{ color: accentColor }} className="flex-shrink-0" />
                <div className="min-w-0">
                  <p
                    style={{
                      color: STYLE.itemTextColor,
                      fontFamily: 'Poppins',
                      fontWeight: '500',
                      fontSize: '14px',
                    }}
                  >
                    {activity.name}
                  </p>
                  <p
                    className="text-xs md:text-sm mt-0.5"
                    style={{ color: STYLE.itemSubColor, fontFamily: 'Poppins', fontWeight: '400' }}
                  >
                    {activity.date} at {activity.time} • {activity.location}
                  </p>
                </div>
              </div>

              {/* Right: date badge */}
              <span
                className="text-xs font-medium flex-shrink-0 ml-3"
                style={{ color: STYLE.itemDateColor, fontFamily: 'Poppins' }}
              >
                {activity.date}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
