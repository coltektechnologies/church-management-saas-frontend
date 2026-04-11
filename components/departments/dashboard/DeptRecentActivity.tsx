'use client';

import { useMemo, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';
import { useDeptActivity } from '@/components/departments/contexts/DeptActivityContext';
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
  textColorLight: '#111111',
  textColorDark: '#F0F4F8',
  subColorLight: '#6B7280',
  subColorDark: '#94A3B8',
  // View All / Details button — themed
  btnBgLight: '#EEEEEF', // Button bg light mode
  btnBgDark: '#1E3A5F', // Button bg dark mode
  btnRadius: '8px',
  btnShadow: '0px 1px 3px rgba(15,23,42,0.08)',
  btnTextLight: '#111111',
  btnTextDark: '#F0F4F8',
  maxItems: 8,
};

const ACTIVITIES_ROUTE = '/departments/activities';

export interface DeptRecentActivityItem {
  id: string;
  icon: string;
  label: string;
  detail: string;
  timestamp: number;
}

const STATIC_FALLBACK: DeptRecentActivityItem[] = [
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

interface DeptRecentActivityProps {
  /** API-driven feed: `null` = loading, array = show (may be empty). Omit to use local activity log + static demo. */
  feedItems?: DeptRecentActivityItem[] | null;
}

export default function DeptRecentActivity({ feedItems }: DeptRecentActivityProps = {}) {
  const router = useRouter();
  const { activities, isReady } = useDeptActivity();
  const { profile, isReady: profileReady } = useDepartmentProfile();
  // ── Use mounted guard to prevent hydration mismatch ───────────────────────
  const { resolvedTheme, mounted } = useDeptTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const accentColor = profileReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';

  const subColor = isDark ? STYLE.subColorDark : STYLE.subColorLight;

  const mergedApiAndLocal = useMemo(() => {
    if (feedItems === undefined || feedItems === null) {
      return null;
    }
    const fromLocal =
      activities.length > 0
        ? activities.map((a) => ({
            id: `local:${a.id}`,
            icon: a.icon,
            label: a.label,
            detail: a.detail,
            timestamp: a.timestamp,
          }))
        : [];
    const combined = [...feedItems, ...fromLocal];
    combined.sort((a, b) => b.timestamp - a.timestamp);
    const seen = new Set<string>();
    const out: DeptRecentActivityItem[] = [];
    for (const it of combined) {
      if (seen.has(it.id)) {
        continue;
      }
      seen.add(it.id);
      out.push(it);
    }
    return out.slice(0, STYLE.maxItems);
  }, [feedItems, activities]);

  if (feedItems === null) {
    const containerBg = isDark ? STYLE.containerBgDark : STYLE.containerBgLight;
    const containerBorder = isDark ? STYLE.containerBorderDark : STYLE.containerBorderLight;
    return (
      <div
        className="p-5 sm:p-6 flex flex-col gap-0 border"
        style={{
          borderRadius: STYLE.containerRadius,
          backgroundColor: containerBg,
          borderColor: containerBorder,
        }}
      >
        <div className="flex items-center gap-2 mb-4">
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
        <p className="text-sm py-8 text-center" style={{ color: subColor, fontFamily: 'Poppins' }}>
          Loading recent activity…
        </p>
      </div>
    );
  }

  const items: DeptRecentActivityItem[] =
    feedItems !== undefined
      ? mergedApiAndLocal ?? []
      : isReady && activities.length > 0
        ? activities.slice(0, STYLE.maxItems).map((a) => ({
            id: a.id,
            icon: a.icon,
            label: a.label,
            detail: a.detail,
            timestamp: a.timestamp,
          }))
        : STATIC_FALLBACK;

  // ── All colours derived after mount so SSR and client agree ───────────────
  const containerBg = isDark ? STYLE.containerBgDark : STYLE.containerBgLight;
  const containerBorder = isDark ? STYLE.containerBorderDark : STYLE.containerBorderLight;
  const dividerColor = isDark ? STYLE.dividerColorDark : STYLE.dividerColorLight;
  const textColor = isDark ? STYLE.textColorDark : STYLE.textColorLight;
  const btnBg = isDark ? STYLE.btnBgDark : STYLE.btnBgLight;
  const btnText = isDark ? STYLE.btnTextDark : STYLE.btnTextLight;

  const btnStyle: CSSProperties = {
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

      {/* Activity rows */}
      <div className="flex flex-col">
        {items.length === 0 && feedItems !== undefined ? (
          <p className="text-sm py-8 text-center" style={{ color: subColor, fontFamily: 'Poppins' }}>
            No recent activity yet.
          </p>
        ) : null}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-3"
            style={{ borderBottom: `1px solid ${dividerColor}` }}
          >
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

            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <span className="text-[11px]" style={{ color: subColor, fontFamily: 'Poppins' }}>
                {timeAgo(item.timestamp)}
              </span>
              <button
                className="text-[11px] sm:text-xs font-semibold px-2 py-1 transition-all duration-200"
                style={btnStyle}
                onClick={() => router.push(ACTIVITIES_ROUTE)}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom divider */}
      <div className="mt-0" style={{ height: '1px', backgroundColor: dividerColor }} />
    </div>
  );
}
