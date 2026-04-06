'use client';

import { useRouter } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';

// ─── Soft-coded style constants ───────────────────────────────────────────────
const STYLE = {
  containerRadius: '10px', // Outer card corner radius
  containerBgLight: '#FFFFFF', // Card background light mode
  containerBgDark: '#1A2B45', // Card background dark mode
  containerBorderLight: '#E5E7EB',
  containerBorderDark: '#2A3F5F',
  dividerColorLight: '#E5E7EB',
  dividerColorDark: '#2A3F5F',
  // Activity item card
  itemBgLight: '#EEEEEF', // Placeholder card bg light
  itemBgDark: '#152A44', // Placeholder card bg dark
  itemRadius: '10px',
  itemTextColorLight: '#111111',
  itemTextColorDark: '#F0F4F8',
  itemSubColorLight: '#6B7280',
  itemSubColorDark: '#94A3B8',
  itemDateColorLight: '#6B7280',
  itemDateColorDark: '#94A3B8',
  // View All button — themed
  btnBgLight: '#EEEEEF',
  btnBgDark: '#1E3A5F',
  btnRadius: '8px',
  btnShadow: '0px 1px 3px rgba(15,23,42,0.08)',
  btnTextLight: '#111111',
  btnTextDark: '#F0F4F8',
};

const ACTIVITIES_ROUTE = '/departments/activities';

export interface DeptActivity {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
}

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
  // ── Use mounted guard to prevent hydration mismatch ───────────────────────
  const { resolvedTheme, mounted } = useDeptTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  // ── All colours derived after mount so SSR and client agree ───────────────
  const containerBg = isDark ? STYLE.containerBgDark : STYLE.containerBgLight;
  const containerBorder = isDark ? STYLE.containerBorderDark : STYLE.containerBorderLight;
  const dividerColor = isDark ? STYLE.dividerColorDark : STYLE.dividerColorLight;
  const itemBg = isDark ? STYLE.itemBgDark : STYLE.itemBgLight;
  const itemTextColor = isDark ? STYLE.itemTextColorDark : STYLE.itemTextColorLight;
  const itemSubColor = isDark ? STYLE.itemSubColorDark : STYLE.itemSubColorLight;
  const itemDateColor = isDark ? STYLE.itemDateColorDark : STYLE.itemDateColorLight;
  const btnBg = isDark ? STYLE.btnBgDark : STYLE.btnBgLight;
  const btnText = isDark ? STYLE.btnTextDark : STYLE.btnTextLight;

  const btnStyle: React.CSSProperties = {
    backgroundColor: btnBg,
    borderRadius: STYLE.btnRadius,
    boxShadow: STYLE.btnShadow,
    color: btnText,
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: '13px',
    border: `1px solid ${isDark ? STYLE.containerBorderDark : 'transparent'}`,
    transition: 'background-color 0.2s ease, color 0.2s ease',
  };

  return (
    <div
      className="p-5 sm:p-6 flex flex-col gap-0 border"
      style={{
        borderRadius: STYLE.containerRadius,
        backgroundColor: containerBg,
        borderColor: containerBorder,
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Header row */}
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
        <button
          onClick={() => router.push(ACTIVITIES_ROUTE)}
          className="text-xs sm:text-sm font-semibold px-3 py-1.5 transition-all duration-200"
          style={btnStyle}
        >
          View All
        </button>
      </div>

      {/* Divider */}
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
              style={{ color: itemSubColor, fontFamily: 'Poppins' }}
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
                backgroundColor: itemBg,
                borderRadius: STYLE.itemRadius,
                border: `1px solid ${isDark ? STYLE.containerBorderDark : 'transparent'}`,
                transition: 'background-color 0.3s ease',
              }}
            >
              {/* Left: icon + name + date/time/location */}
              <div className="flex items-center gap-3 min-w-0">
                <CalendarDays size={18} style={{ color: accentColor }} className="flex-shrink-0" />
                <div className="min-w-0">
                  <p
                    style={{
                      color: itemTextColor,
                      fontFamily: 'Poppins',
                      fontWeight: '500',
                      fontSize: '14px',
                    }}
                  >
                    {activity.name}
                  </p>
                  <p
                    className="text-xs md:text-sm mt-0.5"
                    style={{ color: itemSubColor, fontFamily: 'Poppins', fontWeight: '400' }}
                  >
                    {activity.date} at {activity.time} • {activity.location}
                  </p>
                </div>
              </div>

              {/* Right: date badge */}
              <span
                className="text-xs font-medium flex-shrink-0 ml-3"
                style={{ color: itemDateColor, fontFamily: 'Poppins' }}
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
