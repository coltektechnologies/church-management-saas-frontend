'use client';

import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';
import { useDeptActivity } from '@/components/departments/contexts/DeptActivityContext';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';

// ─── Soft-coded style constants ───────────────────────────────────────────────
const STYLE = {
  containerRadius: '10px', // Outer card corner radius
  containerBgLight: '#FFFFFF', // Card background light mode
  containerBgDark: '#1A2B45', // Card background dark mode
  containerBorderLight: '#E5E7EB', // Card border light mode
  containerBorderDark: '#2A3F5F', // Card border dark mode
  dividerColorLight: '#E5E7EB', // Row divider light
  dividerColorDark: '#2A3F5F', // Row divider dark
  textColorLight: '#111111', // Row main text light
  textColorDark: '#F0F4F8', // Row main text dark
  subColorLight: '#6B7280', // Detail/sub text light
  subColorDark: '#94A3B8',
  // View All button
  btnBg: '#EEEEEF',
  btnBorder: '#6B7280',
  btnRadius: '8px',
  btnShadow: '0px 1px 3px rgba(15,23,42,0.08)',
  btnTextLight: '#111111',
  btnTextDark: '#F0F4F8',
  maxItems: 8,
};

// Activities route — both View All and Details link here
const ACTIVITIES_ROUTE = '/departments/activities';

// Dummy data for testing — replace with live context data
const STATIC_FALLBACK = [
  {
    id: '1',
    icon: '✅',
    label: 'Activity: Choir Practice',
    detail: '2024-08-20',
    timestamp: Date.now() - 86400000,
  },
  {
    id: '2',
    icon: '✅',
    label: 'Activity: Special Music Sabbath',
    detail: '2024-08-24',
    timestamp: Date.now() - 172800000,
  },
  {
    id: '3',
    icon: '📢',
    label: 'Announcement: Choir Practice Canceled',
    detail: 'pending',
    timestamp: Date.now() - 259200000,
  },
  {
    id: '4',
    icon: '📢',
    label: 'Announcement: New Hymnals Available',
    detail: 'approved',
    timestamp: Date.now() - 345600000,
  },
  {
    id: '5',
    icon: '💰',
    label: 'Request: New Microphones',
    detail: 'GHS600',
    timestamp: Date.now() - 432000000,
  },
];

// Formats a timestamp into a relative human-readable string
function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) {
    return 'just now';
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    return `${hrs}h ago`;
  }
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DeptRecentActivity() {
  const router = useRouter();
  const { activities, isReady } = useDeptActivity();
  const { profile } = useDepartmentProfile();

  const isDark = profile.darkMode;
  const accentColor = isDark
    ? profile.darkAccentColor || '#2FC4B2'
    : profile.accentColor || '#2FC4B2';

  // Uses live context data if available, falls back to dummy data
  const items =
    isReady && activities.length > 0 ? activities.slice(0, STYLE.maxItems) : STATIC_FALLBACK;

  const containerBg = isDark ? STYLE.containerBgDark : STYLE.containerBgLight;
  const containerBorder = isDark ? STYLE.containerBorderDark : STYLE.containerBorderLight;
  const dividerColor = isDark ? STYLE.dividerColorDark : STYLE.dividerColorLight;
  const textColor = isDark ? STYLE.textColorDark : STYLE.textColorLight;
  const subColor = isDark ? STYLE.subColorDark : STYLE.subColorLight;
  const btnText = isDark ? STYLE.btnTextDark : STYLE.btnTextLight;

  const btnStyle = {
    backgroundColor: STYLE.btnBg,
    borderRadius: STYLE.btnRadius,
    boxShadow: STYLE.btnShadow,
    color: btnText,
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: '13px',
  };

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
          <Activity size={18} style={{ color: accentColor }} />
          <h3
            className="text-base sm:text-lg"
            style={{
              color: accentColor,
              fontFamily: 'Poppins',
              fontWeight: '700',
              fontSize: '24px',
            }}
          >
            Recent Activity
          </h3>
        </div>
        {/* View All — navigates to activities page */}
        <button
          onClick={() => router.push(ACTIVITIES_ROUTE)}
          className="text-xs sm:text-sm font-semibold px-3 py-1.5 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          style={btnStyle}
        >
          View All
        </button>
      </div>

      {/* Divider  inset from edges to match screenshot */}
      <div
        className="mb-4"
        style={{ height: '1px', backgroundColor: dividerColor, marginLeft: 0, marginRight: 0 }}
      />

      {/* Activity rows each separated by a divider line */}
      <div className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-3"
            style={{ borderBottom: `1px solid ${dividerColor}` }}
          >
            {/* Left: emoji icon + label + detail */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <p
                className="truncate"
                style={{
                  color: textColor,
                  fontFamily: 'Poppins',
                  fontWeight: '100',
                  fontSize: '15px',
                }}
              >
                {item.label}
                {item.detail && (
                  <span style={{ color: subColor, fontFamily: 'Poppins', fontWeight: '400' }}>
                    {' '}
                    – {item.detail}
                  </span>
                )}
              </p>
            </div>

            {/* Right: time ago + Details button */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <span className="text-[11px]" style={{ color: subColor, fontFamily: 'Poppins' }}>
                {timeAgo(item.timestamp)}
              </span>
              <button
                className="text-[11px] sm:text-xs font-semibold px-2 py-1 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                style={btnStyle}
                onClick={() => router.push(ACTIVITIES_ROUTE)}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Divider line */}
      <div className="mt-0" style={{ height: '1px', backgroundColor: dividerColor }} />
    </div>
  );
}
