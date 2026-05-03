'use client';

/**
 * MembersTableHeader.tsx
 */

import { LayoutGrid, List, Table2, FileText, FileSpreadsheet } from 'lucide-react';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDeptTheme } from '@/components/departments/contexts/DeptThemeProvider';

export type ViewMode = 'table' | 'grid';

interface MembersTableHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  totalCount: number;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
}

export default function MembersTableHeader({
  viewMode,
  onViewModeChange,
  totalCount,
  onExport,
}: MembersTableHeaderProps) {
  const { profile, isReady } = useDepartmentProfile();
  const { resolvedTheme, mounted } = useDeptTheme();
  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const primaryColor = isReady
    ? isDark
      ? profile.darkPrimaryColor || '#1A3F6B'
      : profile.primaryColor || '#0B2A4A'
    : '#0B2A4A';
  const accentColor = isReady
    ? isDark
      ? profile.darkAccentColor || '#2FC4B2'
      : profile.accentColor || '#2FC4B2'
    : '#2FC4B2';
  const cardBg = isDark ? '#0D1F36' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const mutedClr = isDark ? 'rgba(255,255,255,0.45)' : '#6B7280';
  const borderClr = isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB';

  const activeViewBg = isDark ? primaryColor : '#0B2A4A';
  const activeViewText = '#FFFFFF';
  const inactiveViewBg = 'transparent';

  // ── Suppress totalCount until after hydration ─────────────────────────────
  // The server renders with DUMMY_MEMBERS only; the client lazy-initialises
  // from localStorage and may have more. Showing null until mounted prevents
  // the server/client text mismatch that causes the hydration warning.
  const displayCount = mounted ? totalCount : null;

  const exportBtn = (label: string, Icon: React.ElementType, fmt: 'csv' | 'pdf' | 'excel') => (
    <button
      key={fmt}
      type="button"
      onClick={() => onExport(fmt)}
      className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-150"
      style={{
        border: `1.5px solid ${borderClr}`,
        borderRadius: '5px',
        background: 'transparent',
        color: mutedClr,
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 500,
        fontSize: '12px',
        cursor: 'pointer',
        lineHeight: '1',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = accentColor;
        (e.currentTarget as HTMLButtonElement).style.color = accentColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = borderClr;
        (e.currentTarget as HTMLButtonElement).style.color = mutedClr;
      }}
    >
      <Icon size={13} strokeWidth={1.5} />
      {label}
    </button>
  );

  const viewBtn = (mode: ViewMode, Icon: React.ElementType, label: string) => {
    const active = viewMode === mode;
    return (
      <button
        key={mode}
        type="button"
        title={label}
        onClick={() => onViewModeChange(mode)}
        className="flex items-center justify-center transition-all duration-150"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '5px',
          border: active ? 'none' : `1.5px solid ${borderClr}`,
          background: active ? activeViewBg : inactiveViewBg,
          color: active ? activeViewText : mutedClr,
          cursor: 'pointer',
        }}
      >
        <Icon size={16} strokeWidth={active ? 2 : 1.5} />
      </button>
    );
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3"
      style={{ background: cardBg, borderBottom: `1px solid ${borderClr}` }}
    >
      {/* Left: title + count */}
      <div className="flex items-center gap-2.5">
        <h2
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: textColor,
            margin: 0,
          }}
        >
          All Members
        </h2>
        {/* Count badge: hidden on server, shown after mount to avoid hydration mismatch */}
        {displayCount !== null && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{
              background: `${accentColor}20`,
              color: accentColor,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {displayCount}
          </span>
        )}
      </div>

      {/* Right: view toggles + exports */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {viewBtn('table', LayoutGrid, 'Table view')}
          {viewBtn('grid', List, 'Grid view')}
        </div>

        <div
          className="hidden sm:block"
          style={{ width: '1px', height: '22px', background: borderClr }}
        />

        <div className="flex items-center gap-1">
          {exportBtn('CSV', Table2, 'csv')}
          {exportBtn('PDF', FileText, 'pdf')}
          {exportBtn('Excel', FileSpreadsheet, 'excel')}
        </div>
      </div>
    </div>
  );
}
